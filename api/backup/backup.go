package backup

import (
	"fmt"
	"os"
	"path"
	"path/filepath"
	"time"

	"github.com/portainer/portainer/api/archive"
	"github.com/portainer/portainer/api/crypto"
	"github.com/portainer/portainer/api/dataservices"
	"github.com/portainer/portainer/api/filesystem"
	"github.com/portainer/portainer/api/http/offlinegate"

	"github.com/pkg/errors"
	"github.com/rs/zerolog/log"
)

const rwxr__r__ os.FileMode = 0o744

var filesToBackup = []string{
	"certs",
	"compose",
	"config.json",
	"custom_templates",
	"edge_jobs",
	"edge_stacks",
	"extensions",
	"portainer.key",
	"portainer.pub",
	"tls",
	"chisel",
}

// Creates a tar.gz system archive and encrypts it if password is not empty. Returns a path to the archive file.
func CreateBackupArchive(password string, gate *offlinegate.OfflineGate, datastore dataservices.DataStore, filestorePath string) (string, error) {
	unlock := gate.Lock()
	defer unlock()

	backupDirPath := filepath.Join(filestorePath, "backup", time.Now().Format("2006-01-02_15-04-05"))
	if err := os.MkdirAll(backupDirPath, rwxr__r__); err != nil {
		return "", errors.Wrap(err, "Failed to create backup dir")
	}

	{
		// new export
		exportFilename := path.Join(backupDirPath, fmt.Sprintf("export-%d.json", time.Now().Unix()))

		err := datastore.Export(exportFilename)
		if err != nil {
			log.Error().Err(err).Str("filename", exportFilename).Msg("failed to export")
		} else {
			log.Debug().Str("filename", exportFilename).Msg("file exported")
		}
	}

	if err := backupDb(backupDirPath, datastore); err != nil {
		return "", errors.Wrap(err, "Failed to backup database")
	}

	for _, filename := range filesToBackup {
		err := filesystem.CopyPath(filepath.Join(filestorePath, filename), backupDirPath)
		if err != nil {
			return "", errors.Wrap(err, "Failed to create backup file")
		}
	}

	archivePath, err := archive.TarGzDir(backupDirPath)
	if err != nil {
		return "", errors.Wrap(err, "Failed to make an archive")
	}

	if password != "" {
		archivePath, err = encrypt(archivePath, password)
		if err != nil {
			return "", errors.Wrap(err, "Failed to encrypt backup with the password")
		}
	}

	return archivePath, nil
}

func backupDb(backupDirPath string, datastore dataservices.DataStore) error {
	backupWriter, err := os.Create(filepath.Join(backupDirPath, "portainer.db"))
	if err != nil {
		return err
	}
	if err = datastore.BackupTo(backupWriter); err != nil {
		return err
	}
	return backupWriter.Close()
}

func encrypt(path string, passphrase string) (string, error) {
	in, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer in.Close()

	outFileName := fmt.Sprintf("%s.encrypted", path)
	out, err := os.Create(outFileName)
	if err != nil {
		return "", err
	}

	err = crypto.AesEncrypt(in, out, []byte(passphrase))

	return outFileName, err
}
