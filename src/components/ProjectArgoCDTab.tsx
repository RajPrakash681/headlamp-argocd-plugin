/*
 * Copyright 2025 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Icon } from '@iconify/react';
import { Alert, Box, Button, Typography } from '@mui/material';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { ArgoCDApplication, getAppSpec, getAppStatus } from '../resources';
import { HealthChip, SyncChip } from './StatusChip';

interface ProjectDefinition {
  id: string;
  namespaces: string[];
  clusters: string[];
}

interface ProjectArgoCDTabProps {
  project: ProjectDefinition;
}

export default function ProjectArgoCDTab({ project }: ProjectArgoCDTabProps) {
  const history = useHistory();
  const location = useLocation();
  const clusterPrefix = location.pathname.match(/^(\/c\/[^/]+)/)?.[1] ?? '';
  const [allApps, error] = ArgoCDApplication.useList();

  if (error) {
    const isNotFound =
      (error as any)?.status === 404 || String(error).includes('not found');
    return (
      <Box p={3}>
        {isNotFound ? (
          <Alert severity="info">
            Argo CD is not installed on this cluster. Install Argo CD to see GitOps deployment
            status here.
          </Alert>
        ) : (
          <Alert severity="error">Failed to load Argo CD Applications: {String(error)}</Alert>
        )}
      </Box>
    );
  }

  if (!allApps) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Icon icon="mdi:loading" style={{ fontSize: 32, animation: 'spin 1s linear infinite' }} />
      </Box>
    );
  }

  const projectNamespaces = new Set(project.namespaces);

  const matchingApps = allApps.filter(app => {
    const spec = getAppSpec(app);
    const nsMatch = projectNamespaces.has(spec.destination.namespace);
    if (!nsMatch) return false;
    if (project.clusters.length === 0) return true;
    const clusterMatch =
      (spec.destination.name && project.clusters.includes(spec.destination.name)) ||
      (spec.destination.server && project.clusters.some(c => spec.destination.server?.includes(c)));
    return clusterMatch !== false;
  });

  if (matchingApps.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="200px"
        textAlign="center"
        p={4}
      >
        <Icon icon="mdi:application-outline" style={{ fontSize: 48, color: '#bbb' }} />
        <Typography variant="h6" mt={2} gutterBottom>
          No Argo CD Applications targeting this project
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          No applications have their destination namespace set to one of:{' '}
          <strong>{project.namespaces.join(', ')}</strong>
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Icon icon="mdi:open-in-new" />}
          onClick={() => history.push(`${clusterPrefix}/argo-cd/applications`)}
        >
          View All Applications
        </Button>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            Argo CD Applications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {matchingApps.length} application{matchingApps.length !== 1 ? 's' : ''} targeting{' '}
            {project.namespaces.join(', ')}
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          onClick={() => history.push(`${clusterPrefix}/argo-cd/applications`)}
          startIcon={<Icon icon="mdi:arrow-top-right" />}
        >
          View All
        </Button>
      </Box>

      <Box
        component="table"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          '& th': {
            textAlign: 'left',
            padding: '8px 12px',
            borderBottom: '2px solid',
            borderColor: 'divider',
            fontWeight: 600,
            fontSize: '0.78rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'text.secondary',
          },
          '& td': {
            padding: '10px 12px',
            borderBottom: '1px solid',
            borderColor: 'divider',
            verticalAlign: 'middle',
          },
          '& tr:hover td': { bgcolor: 'action.hover' },
        }}
      >
        <thead>
          <tr>
            <th>Application</th>
            <th>Argo CD Project</th>
            <th>Sync</th>
            <th>Health</th>
            <th>Repository</th>
            <th>Revision</th>
          </tr>
        </thead>
        <tbody>
          {matchingApps.map(app => {
            const spec = getAppSpec(app);
            const status = getAppStatus(app);
            const appNs = app.metadata?.namespace ?? 'argocd';
            const appName = app.metadata?.name ?? '';
            const repoDisplay = spec.source.repoURL
              .replace(/^https?:\/\//, '')
              .replace(/\.git$/, '');
            const repoTruncated =
              repoDisplay.length > 35 ? repoDisplay.slice(0, 33) + '…' : repoDisplay;

            return (
              <tr key={`${appNs}/${appName}`}>
                <td>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{
                      cursor: 'pointer',
                      color: 'primary.main',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                    onClick={() => history.push(`${clusterPrefix}/argo-cd/applications/${appNs}/${appName}`)}
                  >
                    {appName}
                  </Typography>
                </td>
                <td>
                  <Typography
                    variant="body2"
                    sx={{
                      cursor: 'pointer',
                      color: 'primary.main',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                    onClick={() =>
                      history.push(`${clusterPrefix}/argo-cd/appprojects/${appNs}/${spec.project}`)
                    }
                  >
                    {spec.project}
                  </Typography>
                </td>
                <td>
                  <SyncChip status={status.sync?.status ?? 'Unknown'} />
                </td>
                <td>
                  <HealthChip
                    status={status.health?.status ?? 'Unknown'}
                    tooltip={status.health?.message}
                  />
                </td>
                <td>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
                    title={spec.source.repoURL}
                  >
                    {repoTruncated}
                  </Typography>
                </td>
                <td>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
                  >
                    {spec.source.targetRevision ?? 'HEAD'}
                  </Typography>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Box>
    </Box>
  );
}
