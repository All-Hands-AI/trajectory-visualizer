import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect } from 'vitest';
import { Timeline } from '../components/timeline/Timeline';
import { convertOpenHandsTrajectory } from '../utils/openhands-converter';

describe('Observation Display Test', () => {
  // Mock the formatTimelineDate function
  const mockFormatTimelineDate = vi.fn().mockReturnValue('12:34 PM');
  const mockOnStepSelect = vi.fn();

  test('timeline should properly display observations with full content', () => {
    // Create a sample trajectory with observations
    const sampleTrajectory = [
      {
        id: 1,
        timestamp: "2025-01-20T20:29:32.163218",
        source: "environment",
        message: "Agent state changed to init",
        action: "change_agent_state",
        args: {
          agent_state: "init",
          thought: ""
        }
      },
      {
        id: 2,
        timestamp: "2025-01-20T20:29:35.040676",
        source: "agent",
        message: "Running command: mkdir -p /workspace/todo-app",
        action: "run",
        args: {
          command: "mkdir -p /workspace/todo-app",
          is_input: false,
          thought: "I'll help you create a Vue.js application with all the requested todo list functionality. Let's create this step by step.\n\nFirst, let's create a new directory and set up the basic files:",
          blocking: false,
          hidden: false,
          confirmation_state: "confirmed"
        }
      },
      {
        id: 3,
        timestamp: "2025-01-20T20:29:35.699033",
        source: "agent",
        message: "Command `mkdir -p /workspace/todo-app` executed with exit code 0.",
        cause: 2,
        observation: "run",
        content: "",
        extras: {
          command: "mkdir -p /workspace/todo-app",
          metadata: {
            exit_code: 0,
            pid: -1,
            username: "openhands",
            hostname: "18f4db943d2f",
            working_dir: "/workspace",
            py_interpreter_path: "/openhands/poetry/openhands-ai-5O4_aCHf-py3.12/bin/python",
            prefix: "",
            suffix: "\n[The command completed with exit code 0.]"
          },
          hidden: false
        },
        success: true
      },
      {
        id: 4,
        timestamp: "2025-01-20T20:29:48.925379",
        source: "agent",
        message: "",
        action: "edit",
        args: {
          path: "/workspace/todo-app/index.html",
          content: "",
          start: 1,
          end: -1,
          thought: "Let's create the main HTML file:",
          impl_source: "oh_aci"
        }
      },
      {
        id: 5,
        timestamp: "2025-01-20T20:29:48.925379",
        source: "agent",
        message: "I edited the file /workspace/todo-app/index.html.",
        cause: 4,
        observation: "edit",
        content: "--- /workspace/todo-app/index.html\n+++ /workspace/todo-app/index.html\n@@ -0,0 +1,43 @@\n+<!DOCTYPE html>\n+<html lang=\"en\">\n+<head>\n+    <meta charset=\"UTF-8\">\n+    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n+    <title>Vue Todo App</title>\n+    <script src=\"https://unpkg.com/vue@3/dist/vue.global.js\"></script>\n+    <link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css\" rel=\"stylesheet\">\n+    <style>\n+        .completed {\n+            text-decoration: line-through;\n+            color: #6c757d;\n+        }\n+        .todo-item {\n+            display: flex;\n+            align-items: center;\n+            gap: 1rem;\n+            padding: 0.5rem;\n+            border-bottom: 1px solid #dee2e6;\n+        }\n+        .todo-item:last-child {\n+            border-bottom: none;\n+        }\n+    </style>\n+</head>\n+<body>\n+    <div id=\"app\" class=\"container mt-5\">\n+        <h1 class=\"mb-4\">Todo List</h1>\n+    </div>\n+    <script src=\"app.js\"></script>\n+</body>\n+</html>",
        extras: {
          path: "/workspace/todo-app/index.html",
          metadata: {
            old_content: "",
            new_content: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Vue Todo App</title>\n    <script src=\"https://unpkg.com/vue@3/dist/vue.global.js\"></script>\n    <link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css\" rel=\"stylesheet\">\n    <style>\n        .completed {\n            text-decoration: line-through;\n            color: #6c757d;\n        }\n        .todo-item {\n            display: flex;\n            align-items: center;\n            gap: 1rem;\n            padding: 0.5rem;\n            border-bottom: 1px solid #dee2e6;\n        }\n        .todo-item:last-child {\n            border-bottom: none;\n        }\n    </style>\n</head>\n<body>\n    <div id=\"app\" class=\"container mt-5\">\n        <h1 class=\"mb-4\">Todo List</h1>\n    </div>\n    <script src=\"app.js\"></script>\n</body>\n</html>"
          },
          hidden: false
        },
        success: true
      }
    ];

    // Convert the sample trajectory to timeline entries
    const timelineEntries = convertOpenHandsTrajectory(sampleTrajectory);

    // Log the entries to see what's happening
    console.log('Timeline entries count:', timelineEntries.length);
    console.log('First few entries:', JSON.stringify(timelineEntries.slice(0, 3), null, 2));

    // Render the Timeline component with the converted entries
    render(
      <Timeline
        entries={timelineEntries}
        selectedIndex={0}
        onStepSelect={mockOnStepSelect}
        formatTimelineDate={mockFormatTimelineDate}
        createdAt={new Date().toISOString()}
      />
    );

    // Check if the timeline is rendered with entries
    expect(screen.queryByText('No timeline entries available')).not.toBeInTheDocument();

    // Check for the starting entry
    expect(screen.getByText('Starting trajectory visualization')).toBeInTheDocument();

    // Check for the command
    const commandElements = screen.getAllByText(/mkdir -p \/workspace\/todo-app/);
    expect(commandElements.length).toBeGreaterThan(0);

    // Check for the command output
    const outputElements = screen.getAllByText(/Command.*executed with exit code 0/);
    expect(outputElements.length).toBeGreaterThan(0);

    // Check for the edit message
    const editElements = screen.getAllByText(/I edited the file/);
    expect(editElements.length).toBeGreaterThan(0);

    // Check for the diff content in the edit observation
    const diffStartElements = screen.getAllByText(/--- \/workspace\/todo-app\/index.html/);
    expect(diffStartElements.length).toBeGreaterThan(0);
    
    const diffEndElements = screen.getAllByText(/\+\+\+ \/workspace\/todo-app\/index.html/);
    expect(diffEndElements.length).toBeGreaterThan(0);

    // Check for HTML content in the edit observation
    const doctypeElements = screen.getAllByText(/<!DOCTYPE html>/);
    expect(doctypeElements.length).toBeGreaterThan(0);
    
    const htmlElements = screen.getAllByText(/<html lang="en">/);
    expect(htmlElements.length).toBeGreaterThan(0);

    // Verify that the content is not truncated by checking for elements that would be hidden if truncated
    const titleElements = screen.getAllByText(/Vue Todo App/);
    expect(titleElements.length).toBeGreaterThan(0);
    
    const styleElements = screen.getAllByText(/display: flex;/);
    expect(styleElements.length).toBeGreaterThan(0);

    // Get all the content divs
    const contentDivs = document.querySelectorAll('.text-xs.text-gray-600.dark\\:text-gray-300');
    
    // Check that none of the content divs have the line-clamp-1 class
    contentDivs.forEach(div => {
      expect(div).not.toHaveClass('line-clamp-1');
    });

    // Get all the command divs
    const commandDivs = document.querySelectorAll('.overflow-hidden');
    
    // Check that none of the command divs have the line-clamp-1 class
    commandDivs.forEach(div => {
      expect(div).not.toHaveClass('line-clamp-1');
    });
  });
});