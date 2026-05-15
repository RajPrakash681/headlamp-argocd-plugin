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
  Alert,
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  Link,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { ArgoCDApplication, getAppSpec, getAppStatus } from '../resources';
import type { ArgoResourceStatus } from '../types';
import { HealthChip, SyncChip } from './StatusChip';

interface Params {
  namespace: string;
  name: string;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box display="flex" alignItems="flex-start" py={0.75}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 160, fontWeight: 500, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Box flex={1}>{children}</Box>
    </Box>
  );
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

function ResourcesTable({ resources }: { resources: ArgoResourceStatus[] }) {
  return (
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
          <th>Kind</th>
          <th>Name</th>
          <th>Namespace</th>
          <th>Sync</th>
          <th>Health</th>
        </tr>
      </thead>
      <tbody>
        {resources.map((r, i) => (
          <tr key={i}>
            <td>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {r.kind}
              </Typography>
            </td>
            <td>
              <Typography variant="body2">{r.name}</Typography>
            </td>
            <td>
              <Typography variant="body2" color="text.secondary">
                {r.namespace ?? '—'}
              </Typography>
            </td>
            <td>{r.status ? <SyncChip status={r.status} /> : <Typography variant="body2" color="text.secondary">—</Typography>}</td>
            <td>
              {r.health ? (
                <HealthChip status={r.health.status} tooltip={r.health.message} />
              ) : (
                <Typography variant="body2" color="text.secondary">—</Typography>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Box>
  );
}

export default function ApplicationDetails() {
  const { namespace, name } = useParams<Params>();
  const history = useHistory();
  const location = useLocation();
  const clusterPrefix = location.pathname.match(/^(\/c\/[^/]+)/)?.[1] ?? '';
  const [app, error] = ArgoCDApplication.useGet(name, namespace);

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">Failed to load application: {String(error)}</Alert>
      </Box>
    );
  }

  if (!app) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Icon icon="mdi:loading" style={{ fontSize: 40, animation: 'spin 1s linear infinite' }} />
      </Box>
    );
  }

  const spec = getAppSpec(app);
  const status = getAppStatus(app);

  const lastSyncTime = status.operationState?.finishedAt
    ? new Date(status.operationState.finishedAt).toLocaleString()
    : 'Never';

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Tooltip title="Back to Applications">
          <IconButton onClick={() => history.push(`${clusterPrefix}/argo-cd/applications`)} size="small">
            <Icon icon="mdi:arrow-left" />
          </IconButton>
        </Tooltip>
        <Icon icon="mdi:application" style={{ fontSize: 28, color: '#e96d3b' }} />
        <Box>
          <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {namespace} / Application
          </Typography>
        </Box>
      </Box>

      {/* Status Overview */}
      <Section title="Status">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <InfoRow label="Sync Status">
              <SyncChip status={status.sync?.status ?? 'Unknown'} />
            </InfoRow>
            <InfoRow label="Revision">
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {status.sync?.revision ? status.sync.revision.slice(0, 8) : '—'}
              </Typography>
            </InfoRow>
            <InfoRow label="Last Synced">
              <Typography variant="body2">{lastSyncTime}</Typography>
            </InfoRow>
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoRow label="Health">
              <HealthChip
                status={status.health?.status ?? 'Unknown'}
                tooltip={status.health?.message}
              />
            </InfoRow>
            {status.health?.message && (
              <InfoRow label="Health Message">
                <Typography variant="body2" color="text.secondary">
                  {status.health.message}
                </Typography>
              </InfoRow>
            )}
            {status.operationState?.message && (
              <InfoRow label="Operation Message">
                <Typography variant="body2" color="text.secondary">
                  {status.operationState.message}
                </Typography>
              </InfoRow>
            )}
          </Grid>
        </Grid>
        {spec.syncPolicy?.automated && (
          <Box mt={1} display="flex" gap={1} flexWrap="wrap">
            <Chip size="small" label="Auto-Sync" color="primary" variant="outlined" />
            {spec.syncPolicy.automated.prune && (
              <Chip size="small" label="Prune" variant="outlined" />
            )}
            {spec.syncPolicy.automated.selfHeal && (
              <Chip size="small" label="Self-Heal" variant="outlined" />
            )}
          </Box>
        )}
      </Section>

      {/* Source */}
      <Section title="Source">
        <InfoRow label="Repository">
          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
              {spec.source.repoURL}
            </Typography>
            <Link href={spec.source.repoURL} target="_blank" rel="noopener noreferrer">
              <Icon icon="mdi:open-in-new" style={{ fontSize: 14, verticalAlign: 'middle' }} />
            </Link>
          </Box>
        </InfoRow>
        {spec.source.path && (
          <InfoRow label="Path">
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {spec.source.path}
            </Typography>
          </InfoRow>
        )}
        <InfoRow label="Target Revision">
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {spec.source.targetRevision ?? 'HEAD'}
          </Typography>
        </InfoRow>
        {spec.source.chart && (
          <InfoRow label="Helm Chart">
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {spec.source.chart}
            </Typography>
          </InfoRow>
        )}
      </Section>

      {/* Destination */}
      <Section title="Destination">
        <InfoRow label="Namespace">
          <Typography variant="body2">{spec.destination.namespace}</Typography>
        </InfoRow>
        {spec.destination.server && (
          <InfoRow label="Cluster Server">
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
              {spec.destination.server}
            </Typography>
          </InfoRow>
        )}
        {spec.destination.name && (
          <InfoRow label="Cluster Name">
            <Typography variant="body2">{spec.destination.name}</Typography>
          </InfoRow>
        )}
        <InfoRow label="Argo CD Project">
          <Typography
            variant="body2"
            sx={{
              cursor: 'pointer',
              color: 'primary.main',
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() =>
              history.push(`${clusterPrefix}/argo-cd/appprojects/${namespace}/${spec.project}`)
            }
          >
            {spec.project}
          </Typography>
        </InfoRow>
      </Section>

      {/* Managed Resources */}
      {status.resources && status.resources.length > 0 && (
        <Section title={`Managed Resources (${status.resources.length})`}>
          <ResourcesTable resources={status.resources} />
        </Section>
      )}

      {/* Images */}
      {status.summary?.images && status.summary.images.length > 0 && (
        <Section title="Images">
          <Box display="flex" flexWrap="wrap" gap={1}>
            {status.summary.images.map((img, i) => (
              <Chip
                key={i}
                size="small"
                label={img}
                icon={<Icon icon="mdi:docker" style={{ fontSize: 14 }} />}
                sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </Section>
      )}

      {/* Conditions */}
      {status.conditions && status.conditions.length > 0 && (
        <Section title="Conditions">
          <Box display="flex" flexDirection="column" gap={1}>
            {status.conditions.map((cond, i) => (
              <Alert key={i} severity="warning" sx={{ py: 0.5 }}>
                <Typography variant="body2" fontWeight={500}>
                  {cond.type}
                </Typography>
                <Typography variant="body2">{cond.message}</Typography>
              </Alert>
            ))}
          </Box>
        </Section>
      )}

      <Divider sx={{ my: 2 }} />
      <Box display="flex" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          Reconciled: {status.reconciledAt ? new Date(status.reconciledAt).toLocaleString() : '—'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          argoproj.io/v1alpha1 / Application
        </Typography>
      </Box>
    </Box>
  );
}
