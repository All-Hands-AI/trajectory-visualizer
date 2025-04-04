import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect } from 'vitest';
import RunDetails from '../components/RunDetails';
import demo1Data from '../../demo1.json';
import { UploadContent } from '../types/upload';

describe('Demo1 JSON Display in RunDetails', () => {
  test('demo1.json should be properly displayed in RunDetails', () => {
    // Log the demo1.json data
    console.log('Demo1 data length:', demo1Data.length);
    console.log('First few demo1 entries:', JSON.stringify(demo1Data.slice(0, 3), null, 2));
    
    // Create mock upload content with demo1.json
    const uploadContent: UploadContent = {
      content: {
        trajectoryData: demo1Data,
        fileType: 'trajectory'
      }
    };
    
    // Mock the window.matchMedia function used in RunDetails
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    // Render the RunDetails component with the demo1.json data
    render(
      <RunDetails
        owner="local"
        repo="trajectory"
        run={{
          id: 0,
          name: 'Local Trajectory',
          head_branch: '',
          head_sha: '',
          run_number: 0,
          event: 'local',
          status: 'completed',
          conclusion: 'success',
          workflow_id: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          html_url: '',
          run_attempt: 1,
          run_started_at: new Date().toISOString(),
          jobs_url: '',
          logs_url: '',
          workflow_name: 'Local Trajectory'
        }}
        initialContent={uploadContent}
      />
    );
    
    // Check that the timeline is rendered with entries
    expect(screen.queryByText('No timeline entries available')).not.toBeInTheDocument();
    
    // Check for the starting entry
    expect(screen.getByText('Starting trajectory visualization')).toBeInTheDocument();
    
    // Log what's being rendered
    console.log('Screen content:', document.body.textContent);
  });
});