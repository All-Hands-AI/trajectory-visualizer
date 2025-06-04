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
    - `/src/components/jsonl-viewer/CollapsableDiffPanel.tsx`: Collapsable panel for displaying diffs
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
- `CollapsableDiffPanel.tsx`: Collapsable panel for displaying diffs above the trajectory

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
  2. In the `CollapsableDiffPanel` component to display the same patch files in a collapsable panel above the trajectory
- The `handleFileEditClick` function in `RunDetails.tsx` updates the artifact content with patch data when a file edit is clicked

### Collapsable Diff Panel
- The `CollapsableDiffPanel` component is a collapsable panel that displays file changes
- It is collapsed by default and can be expanded by clicking on it
- It uses the `parse-diff` library to properly parse git diff format
- It displays the diffs in a more readable format with file names and changes
- It provides more space for displaying diffs compared to the Entry Metadata panel
- It uses helper functions `extractOldContent` and `extractNewContent` to extract old and new content from parsed diffs
- It displays "Groundtruth Patch" instead of "Instance Patch" in the UI (while keeping the field name the same)
- It properly handles the git diff format with the example format:
  ```
  diff --git a/astropy/modeling/separable.py b/astropy/modeling/separable.py
  --- a/astropy/modeling/separable.py
  +++ b/astropy/modeling/separable.py
  @@ -242,7 +242,7 @@ def _cstack(left, right):
         cright = _coord_matrix(right, 'right', noutp)
     else:
         cright = np.zeros((noutp, right.shape[1]))
  -        cright[-right.shape[0]:, -right.shape[1]:] = 1
  +        cright[-right.shape[0]:, -right.shape[1]:] = right
  
     return np.hstack([cleft, right])
  ```

### Data Flow
1. Timeline entries are loaded from the artifact content
2. When a file edit is clicked, the patch data is extracted from the entry metadata
3. The patch data is added to the artifact content
4. The `ArtifactDetails` component renders the patch data using the `DiffViewer` component
5. The `CollapsableDiffPanel` component renders the patch data using the `DiffViewer` component in a collapsable panel above the trajectory