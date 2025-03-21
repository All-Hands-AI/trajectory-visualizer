# Trajectory Visualizer Repository Information

## Project Overview
The Trajectory Visualizer is a web application for visualizing OpenHands Resolver execution trajectories. It provides a timeline view of actions and observations during the execution of OpenHands agents.

## Repository Structure
- `/src/components/`: React components
  - `/src/components/timeline/`: Timeline visualization components
    - `/src/components/timeline/components/`: Timeline subcomponents
  - `/src/components/artifacts/`: Artifact details components
  - `/src/components/diff-viewer.tsx`: Diff viewer component for file changes
  - `/src/components/jsonl-viewer/`: JSONL viewer components
  - `/src/components/share/`: Shared components for trajectory visualization
- `/src/services/`: API services
- `/src/utils/`: Utility functions
- `/src/types/`: TypeScript type definitions

## Common Commands
- `npm start`: Start development server
- `npm build`: Build production-ready app
- `npm test`: Run tests

## Code Style Preferences
- React functional components with TypeScript
- Tailwind CSS for styling
- React hooks for state management

## Key Components

### Timeline Components
- `Timeline.tsx`: Main timeline component that renders a list of timeline steps
- `TimelineStep.tsx`: Individual timeline step component
- `TimelineEntry`: Interface for timeline entry data

### JSONL Viewer Components
- `JsonlViewer.tsx`: Component for viewing JSONL files with trajectory data
- `JsonlViewerSettings.tsx`: Settings for the JSONL viewer

### Artifact Components
- `ArtifactDetails.tsx`: Component for displaying artifact details, including diff views for patches

### Diff Viewer
- `diff-viewer.tsx`: Component for displaying file diffs using `react-diff-viewer-continued`

## Implementation Details

### Diff File View
- The diff viewer is implemented in `/src/components/diff-viewer.tsx`
- It uses `react-diff-viewer-continued` to display file diffs
- The diff viewer is used in two places:
  1. In the `ArtifactDetails` component to display `.instance.patch` and `.test_result.git_patch` files
  2. In the `JsonlViewer` component's Entry Metadata panel to display the same patch files
- The `handleFileEditClick` function in `RunDetails.tsx` updates the artifact content with patch data when a file edit is clicked

### Data Flow
1. Timeline entries are loaded from the artifact content
2. When a file edit is clicked, the patch data is extracted from the entry metadata
3. The patch data is added to the artifact content
4. The `ArtifactDetails` component renders the patch data using the `DiffViewer` component
5. The `JsonlViewer` component's Entry Metadata panel also renders the patch data using the `DiffViewer` component