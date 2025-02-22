import { Box, Edit, Layers, Lock, Network, Server } from 'lucide-react';

import { EnvironmentId } from '@/react/portainer/environments/types';
import { Authorized } from '@/react/hooks/useUser';
import { isBE } from '@/react/portainer/feature-flags/feature-flags.service';

import { DashboardLink } from '../items/DashboardLink';
import { SidebarItem } from '../SidebarItem';
import { VolumesLink } from '../items/VolumesLink';
import { SidebarParent } from '../SidebarItem/SidebarParent';

import { KubectlShellButton } from './KubectlShell';

interface Props {
  environmentId: EnvironmentId;
}

export function KubernetesSidebar({ environmentId }: Props) {
  return (
    <>
      <div className="w-full flex mb-2 justify-center -mt-2">
        <KubectlShellButton environmentId={environmentId} />
      </div>

      <DashboardLink
        environmentId={environmentId}
        platformPath="kubernetes"
        data-cy="k8sSidebar-dashboard"
      />

      <SidebarItem
        to="kubernetes.templates.custom"
        params={{ endpointId: environmentId }}
        icon={Edit}
        label="Custom Templates"
        data-cy="k8sSidebar-customTemplates"
      />

      <SidebarItem
        to="kubernetes.resourcePools"
        params={{ endpointId: environmentId }}
        icon={Layers}
        label="Namespaces"
        data-cy="k8sSidebar-namespaces"
      />

      <SidebarItem
        to="kubernetes.applications"
        params={{ endpointId: environmentId }}
        icon={Box}
        label="Applications"
        data-cy="k8sSidebar-applications"
      />

      <SidebarParent
        label="Networking"
        icon={Network}
        to="kubernetes.services"
        params={{ endpointId: environmentId }}
        pathOptions={{ includePaths: ['kubernetes.ingresses'] }}
        data-cy="k8sSidebar-networking"
      >
        <SidebarItem
          to="kubernetes.services"
          params={{ endpointId: environmentId }}
          label="Services"
          isSubMenu
          data-cy="k8sSidebar-services"
        />

        <SidebarItem
          to="kubernetes.ingresses"
          params={{ endpointId: environmentId }}
          label="Ingresses"
          isSubMenu
          data-cy="k8sSidebar-ingresses"
        />
      </SidebarParent>

      <SidebarItem
        to="kubernetes.configurations"
        params={{ endpointId: environmentId }}
        icon={Lock}
        label="ConfigMaps & Secrets"
        data-cy="k8sSidebar-configurations"
      />

      <VolumesLink
        environmentId={environmentId}
        platformPath="kubernetes"
        data-cy="k8sSidebar-volumes"
      />

      <SidebarParent
        label="Cluster"
        icon={Server}
        to="kubernetes.cluster"
        params={{ endpointId: environmentId }}
        pathOptions={{ includePaths: ['kubernetes.registries'] }}
        data-cy="k8sSidebar-cluster"
      >
        <SidebarItem
          label="Details"
          to="kubernetes.cluster"
          ignorePaths={[
            'kubernetes.cluster.setup',
            'kubernetes.cluster.securityConstraint',
          ]}
          params={{ endpointId: environmentId }}
          isSubMenu
          data-cy="k8sSidebar-clusterDetails"
        />
        <Authorized
          authorizations="K8sClusterSetupRW"
          adminOnlyCE
          environmentId={environmentId}
        >
          <SidebarItem
            to="kubernetes.cluster.setup"
            params={{ endpointId: environmentId }}
            label="Setup"
            isSubMenu
            data-cy="k8sSidebar-setup"
          />
        </Authorized>

        <Authorized
          authorizations="K8sClusterSetupRW"
          adminOnlyCE
          environmentId={environmentId}
        >
          <SidebarItem
            to="kubernetes.cluster.securityConstraint"
            params={{ endpointId: environmentId }}
            label="Security constraints"
            isSubMenu
            data-cy="k8sSidebar-securityConstraints"
          />
        </Authorized>

        {isBE && (
          <Authorized
            authorizations="K8sClusterSetupRW"
            adminOnlyCE
            environmentId={environmentId}
          >
            <SidebarItem
              to="kubernetes.cluster.securityConstraint"
              params={{ endpointId: environmentId }}
              label="Security Constraints"
              isSubMenu
              data-cy="k8sSidebar-securityConstraints"
            />
          </Authorized>
        )}

        <SidebarItem
          to="kubernetes.registries"
          params={{ endpointId: environmentId }}
          label="Registries"
          isSubMenu
          data-cy="k8sSidebar-registries"
        />
      </SidebarParent>
    </>
  );
}
