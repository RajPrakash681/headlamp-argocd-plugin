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

import {
  ApiProxy,
  registerProjectDetailsTab,
  registerRoute,
  registerSidebarEntry,
} from '@kinvolk/headlamp-plugin/lib';
import React from 'react';
import AppProjectDetails from './components/AppProjectDetails';
import AppProjectList from './components/AppProjectList';
import ApplicationDetails from './components/ApplicationDetails';
import ApplicationList from './components/ApplicationList';
import ProjectArgoCDTab from './components/ProjectArgoCDTab';

// --- Sidebar entries ---

registerSidebarEntry({
  parent: null,
  name: 'argo-cd',
  label: 'Argo CD',
  icon: 'simple-icons:argo',
  url: '/argo-cd/applications',
  useClusterURL: true,
});

registerSidebarEntry({
  parent: 'argo-cd',
  name: 'argo-cd-applications',
  label: 'Applications',
  url: '/argo-cd/applications',
  useClusterURL: true,
  icon: 'mdi:application-outline',
});

registerSidebarEntry({
  parent: 'argo-cd',
  name: 'argo-cd-appprojects',
  label: 'App Projects',
  url: '/argo-cd/appprojects',
  useClusterURL: true,
  icon: 'mdi:folder-multiple-outline',
});

// --- Routes ---

registerRoute({
  path: '/argo-cd/applications',
  sidebar: 'argo-cd-applications',
  name: 'ArgoCDApplications',
  useClusterURL: true,
  exact: true,
  component: () => <ApplicationList />,
});

registerRoute({
  path: '/argo-cd/applications/:namespace/:name',
  sidebar: 'argo-cd-applications',
  name: 'ArgoCDApplicationDetails',
  useClusterURL: true,
  exact: true,
  component: () => <ApplicationDetails />,
});

registerRoute({
  path: '/argo-cd/appprojects',
  sidebar: 'argo-cd-appprojects',
  name: 'ArgoCDAppProjects',
  useClusterURL: true,
  exact: true,
  component: () => <AppProjectList />,
});

registerRoute({
  path: '/argo-cd/appprojects/:namespace/:name',
  sidebar: 'argo-cd-appprojects',
  name: 'ArgoCDAppProjectDetails',
  useClusterURL: true,
  exact: true,
  component: () => <AppProjectDetails />,
});

// --- Project Details Tab ---

registerProjectDetailsTab({
  id: 'headlamp-projects.tabs.argo-cd',
  label: 'Argo CD',
  icon: 'simple-icons:argo',
  component: ({ project }) => <ProjectArgoCDTab project={project} />,
  isEnabled: async () => true,
});
