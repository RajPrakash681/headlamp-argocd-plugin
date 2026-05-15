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
import { Alert, Box, Chip, Typography } from '@mui/material';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { ArgoCDAppProject, getProjectSpec } from '../resources';

export default function AppProjectList() {
  const history = useHistory();
  const location = useLocation();
  const clusterPrefix = location.pathname.match(/^(\/c\/[^/]+)/)?.[1] ?? '';
  const [projects, error] = ArgoCDAppProject.useList();

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
          {isNotFound
            ? 'Argo CD is not installed on this cluster'
            : 'Failed to load App Projects'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isNotFound ? 'Install Argo CD and its CRDs to use this plugin.' : String(error)}
        </Typography>
      </Box>
    );
  }

  if (!projects) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Icon icon="mdi:loading" style={{ fontSize: 32, animation: 'spin 1s linear infinite' }} />
      </Box>
    );
  }

  if (projects.length === 0) {
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
        <Icon icon="mdi:folder-outline" style={{ fontSize: 56, color: '#bbb' }} />
        <Typography variant="h6" mt={2} gutterBottom>
          No Argo CD App Projects found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create an Argo CD AppProject to group and control access to Applications.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Box mb={2}>
        <Typography variant="h5" fontWeight={600}>
          Argo CD App Projects
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
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
            <th>Description</th>
            <th>Source Repos</th>
            <th>Destinations</th>
            <th>Roles</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(proj => {
            const spec = getProjectSpec(proj);
            const ns = proj.metadata?.namespace ?? 'argocd';
            const name = proj.metadata?.name ?? '';
            const destinations = spec.destinations
              .map(d => d.namespace)
              .filter(Boolean)
              .join(', ');

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
                    onClick={() => history.push(`${clusterPrefix}/argo-cd/appprojects/${ns}/${name}`)}
                  >
                    {name}
                  </Typography>
                </td>
                <td>
                  <Typography variant="body2" color="text.secondary">
                    {spec.description || '—'}
                  </Typography>
                </td>
                <td>
                  <Chip
                    size="small"
                    label={spec.sourceRepos.length}
                    color={spec.sourceRepos.includes('*') ? 'warning' : 'default'}
                    variant="outlined"
                    title={spec.sourceRepos.join(', ')}
                  />
                </td>
                <td>
                  <Typography variant="body2">{destinations || '—'}</Typography>
                </td>
                <td>
                  <Chip
                    size="small"
                    label={spec.roles?.length ?? 0}
                    variant="outlined"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Box>
    </Box>
  );
}
