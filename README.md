# Smart Task Planner

AI-powered smart task planner that converts goals into actionable tasks using LLM reasoning with beautiful timeline visualization.

## Features

- **AI-Powered Planning**: Uses Groq's Llama 3.1 model to break down goals into actionable tasks
- **Interactive Timeline**: Beautiful Gantt chart visualization with dependency tracking
- **Task Management**: Automatic dependency resolution and priority assignment
- **Export Options**: Download plans as PDF or copy as JSON
- **Dark/Light Theme**: Toggle between dark and light modes
- **Real-time Progress**: Visual progress tracking for each task
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Groq SDK** for AI task generation
- **CORS** enabled for cross-origin requests

### Frontend
- **React 19** with modern hooks
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Icons** for UI elements
- **html2canvas & jsPDF** for export functionality

## Prerequisites

- Node.js (v14 or higher)
- Groq API key

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/adi1424/smart-task-planner.git
   cd smart-task-planner
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   PORT=4000
   ```

## Usage

1. **Start the backend server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

2. **Start the frontend (in a new terminal)**
   ```bash
   cd frontend
   npm start
   ```

3. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## How It Works

1. **Input Goal**: Enter your project goal (e.g., "Build an e-commerce website in 14 days")
2. **AI Processing**: The system uses Groq's Llama 3.1 model to analyze and break down your goal
3. **Task Generation**: Creates structured tasks with:
   - Task ID and name
   - Detailed description
   - Dependencies between tasks
   - Estimated duration in days
   - Priority levels (High/Medium/Low)
4. **Timeline Visualization**: Displays tasks in an interactive Gantt chart
5. **Export Options**: Download as PDF or copy JSON data

## API Endpoints

### POST `/api/generate-plan`
Generates a task plan from a goal description.

**Request Body:**
```json
{
  "goal": "Your project goal description"
}
```

**Response:**
```json
{
  "plan": {
    "goal": "Your project goal",
    "tasks": [
      {
        "task_id": 1,
        "name": "Task name",
        "description": "Task description",
        "depends_on": [],
        "estimated_days": 3,
        "priority": "High"
      }
    ]
  }
}
```

## Project Structure

```
smart-task-planner/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   ├── index.js         # React entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── index.js                 # Express server
├── prompt_template.txt      # AI prompt template
├── package.json            # Backend dependencies
├── .env                    # Environment variables
└── README.md              # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/adi1424/smart-task-planner/issues) on GitHub.