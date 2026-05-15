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
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { ArgoCDApplication, getAppSpec, getAppStatus } from '../resources';
import { HealthChip, SyncChip } from './StatusChip';

function RepoLink({ url }: { url: string }) {
  const display = url.replace(/^https?:\/\//, '').replace(/\.git$/, '');
  const truncated = display.length > 40 ? display.slice(0, 38) + '…' : display;
  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
        {truncated}
      </Typography>
      <Tooltip title={`Open ${url}`}>
        <IconButton
          size="small"
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ p: 0.25 }}
        >
          <Icon icon="mdi:open-in-new" style={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function RelativeTime({ isoString }: { isoString?: string }) {
  if (!isoString) return <Typography variant="body2" color="text.secondary">—</Typography>;

  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  let label: string;
  if (diffMins < 1) label = 'just now';
  else if (diffMins < 60) label = `${diffMins}m ago`;
  else if (diffMins < 1440) label = `${Math.floor(diffMins / 60)}h ago`;
  else label = `${Math.floor(diffMins / 1440)}d ago`;

  return (
    <Tooltip title={date.toLocaleString()}>
      <Typography variant="body2">{label}</Typography>
    </Tooltip>
  );
}

function useClusterPrefix(): string {
  const location = useLocation();
  const match = location.pathname.match(/^(\/c\/[^/]+)/);
  return match ? match[1] : '';
}

export default function ApplicationList() {
  const history = useHistory();
  const clusterPrefix = useClusterPrefix();
  const [applications, error] = ArgoCDApplication.useList();

  if (error) {
    const isNotFound =
      (error as any)?.status === 404 || String(error).includes('not found');
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="300px"
        textAlign="center"
        p={4}
      >
        <Icon icon="mdi:alert-circle-outline" style={{ fontSize: 56, color: '#bbb' }} />
        <Typography variant="h6" mt={2} gutterBottom>
          {isNotFound ? 'Argo CD is not installed on this cluster' : 'Failed to load Applications'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isNotFound
            ? 'Install Argo CD and its CRDs to use this plugin.'
            : String(error)}
        </Typography>
      </Box>
    );
  }

  if (!applications) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Icon icon="mdi:loading" style={{ fontSize: 32, animation: 'spin 1s linear infinite' }} />
      </Box>
    );
  }

  if (applications.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="300px"
        textAlign="center"
        p={4}
      >
        <Icon icon="mdi:application-outline" style={{ fontSize: 56, color: '#bbb' }} />
        <Typography variant="h6" mt={2} gutterBottom>
          No Argo CD Applications found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create an Argo CD Application to start managing GitOps deployments.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Box mb={2}>
        <Typography variant="h5" fontWeight={600}>
          Argo CD Applications
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </Typography>
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
            fontSize: '0.8rem',
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
            <th>Name</th>
            <th>Project</th>
            <th>Sync</th>
            <th>Health</th>
            <th>Repository</th>
            <th>Revision</th>
            <th>Destination</th>
            <th>Last Synced</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => {
            const spec = getAppSpec(app);
            const status = getAppStatus(app);
            const ns = app.metadata?.namespace ?? 'argocd';
            const name = app.metadata?.name ?? '';
            const destLabel = spec.destination.name
              ? `${spec.destination.namespace} @ ${spec.destination.name}`
              : `${spec.destination.namespace}`;

            return (
              <tr key={`${ns}/${name}`}>
                <td>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{
                      cursor: 'pointer',
                      color: 'primary.main',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                    onClick={() =>
                      history.push(`${clusterPrefix}/argo-cd/applications/${ns}/${name}`)
                    }
                  >
                    {name}
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
                      history.push(`${clusterPrefix}/argo-cd/appprojects/${ns}/${spec.project}`)
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
                  <RepoLink url={spec.source.repoURL} />
                </td>
                <td>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                    {spec.source.targetRevision ?? 'HEAD'}
                  </Typography>
                </td>
                <td>
                  <Typography variant="body2">{destLabel}</Typography>
                </td>
                <td>
                  <RelativeTime isoString={status.operationState?.finishedAt} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Box>
    </Box>
  );
}
