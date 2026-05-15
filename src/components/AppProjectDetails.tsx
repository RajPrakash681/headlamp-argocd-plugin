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
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import {
  ArgoCDAppProject,
  ArgoCDApplication,
  getAppSpec,
  getAppStatus,
  getProjectSpec,
} from '../resources';
import { HealthChip, SyncChip } from './StatusChip';

interface Params {
  namespace: string;
  name: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ mb: 2 }}>
      <Box px={2} py={1.5} borderBottom="1px solid" borderColor="divider">
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Box px={2} py={1.5}>
        {children}
      </Box>
    </Paper>
  );
}

export default function AppProjectDetails() {
  const { namespace, name } = useParams<Params>();
  const history = useHistory();
  const location = useLocation();
  const clusterPrefix = location.pathname.match(/^(\/c\/[^/]+)/)?.[1] ?? '';

  const [project, projectError] = ArgoCDAppProject.useGet(name, namespace);
  const [allApps] = ArgoCDApplication.useList();

  if (projectError) {
    return (
      <Box p={3}>
        <Alert severity="error">Failed to load App Project: {String(projectError)}</Alert>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Icon icon="mdi:loading" style={{ fontSize: 40, animation: 'spin 1s linear infinite' }} />
      </Box>
    );
  }

  const spec = getProjectSpec(project);
  const projectApps = (allApps ?? []).filter(
    app => getAppSpec(app).project === name
  );

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Tooltip title="Back to App Projects">
          <IconButton onClick={() => history.push(`${clusterPrefix}/argo-cd/appprojects`)} size="small">
            <Icon icon="mdi:arrow-left" />
          </IconButton>
        </Tooltip>
        <Icon icon="mdi:folder-open" style={{ fontSize: 28, color: '#5c6bc0' }} />
        <Box>
          <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {namespace} / AppProject
          </Typography>
        </Box>
      </Box>

      {spec.description && (
        <Typography variant="body1" color="text.secondary" mb={3}>
          {spec.description}
        </Typography>
      )}

      {/* Source Repositories */}
      <Section title={`Source Repositories (${spec.sourceRepos.length})`}>
        {spec.sourceRepos.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No source repositories configured.
          </Typography>
        ) : (
          <List dense disablePadding>
            {spec.sourceRepos.map((repo, i) => (
              <ListItem key={i} disableGutters sx={{ py: 0.25 }}>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {repo === '*' ? (
                        <Chip size="small" label="Any (*)" color="warning" variant="outlined" />
                      ) : (
                        <>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                          >
                            {repo}
                          </Typography>
                          <Link href={repo} target="_blank" rel="noopener noreferrer">
                            <Icon icon="mdi:open-in-new" style={{ fontSize: 13 }} />
                          </Link>
                        </>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Section>

      {/* Destinations */}
      <Section title={`Destinations (${spec.destinations.length})`}>
        {spec.destinations.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No destinations configured.
          </Typography>
        ) : (
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              '& th': {
                textAlign: 'left',
                padding: '6px 10px',
                borderBottom: '2px solid',
                borderColor: 'divider',
                fontWeight: 600,
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'text.secondary',
              },
              '& td': {
                padding: '8px 10px',
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            <thead>
              <tr>
                <th>Namespace</th>
                <th>Cluster Server</th>
                <th>Cluster Name</th>
              </tr>
            </thead>
            <tbody>
              {spec.destinations.map((dest, i) => (
                <tr key={i}>
                  <td>
                    <Typography variant="body2">
                      {dest.namespace === '*' ? (
                        <Chip size="small" label="Any (*)" color="warning" variant="outlined" />
                      ) : (
                        dest.namespace
                      )}
                    </Typography>
                  </td>
                  <td>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                    >
                      {dest.server ?? '—'}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="body2">{dest.name ?? '—'}</Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </Box>
        )}
      </Section>

      {/* Roles */}
      {spec.roles && spec.roles.length > 0 && (
        <Section title={`Roles (${spec.roles.length})`}>
          {spec.roles.map((role, i) => (
            <Accordion key={i} disableGutters variant="outlined" sx={{ mb: 0.5 }}>
              <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Icon icon="mdi:account-key" style={{ fontSize: 18 }} />
                  <Typography variant="body2" fontWeight={500}>
                    {role.name}
                  </Typography>
                  {role.description && (
                    <Typography variant="body2" color="text.secondary">
                      — {role.description}
                    </Typography>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {role.policies && role.policies.length > 0 ? (
                  <List dense disablePadding>
                    {role.policies.map((policy, j) => (
                      <ListItem key={j} disableGutters sx={{ py: 0.25 }}>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
                            >
                              {policy}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No policies defined.
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Section>
      )}

      {/* Applications in this project */}
      <Section title={`Applications in this Project (${projectApps.length})`}>
        {projectApps.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No applications belong to this project.
          </Typography>
        ) : (
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              '& th': {
                textAlign: 'left',
                padding: '6px 10px',
                borderBottom: '2px solid',
                borderColor: 'divider',
                fontWeight: 600,
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'text.secondary',
              },
              '& td': {
                padding: '8px 10px',
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
                <th>Sync</th>
                <th>Health</th>
                <th>Destination</th>
              </tr>
            </thead>
            <tbody>
              {projectApps.map(app => {
                const appSpec = getAppSpec(app);
                const appStatus = getAppStatus(app);
                const appNs = app.metadata?.namespace ?? 'argocd';
                const appName = app.metadata?.name ?? '';
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
                        onClick={() =>
                          history.push(`${clusterPrefix}/argo-cd/applications/${appNs}/${appName}`)
                        }
                      >
                        {appName}
                      </Typography>
                    </td>
                    <td>
                      <SyncChip status={appStatus.sync?.status ?? 'Unknown'} />
                    </td>
                    <td>
                      <HealthChip
                        status={appStatus.health?.status ?? 'Unknown'}
                        tooltip={appStatus.health?.message}
                      />
                    </td>
                    <td>
                      <Typography variant="body2">
                        {appSpec.destination.namespace}
                      </Typography>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Box>
        )}
      </Section>
    </Box>
  );
}
