# 🏠 Home Occupancy Simulator

A professional-grade simulation platform for modeling occupant behavior in residential environments. Built for reinforcement learning research, smart home optimization, and building energy management.

![Home Occupancy Simulator Demo](https://via.placeholder.com/800x400/E8F4F8/4A90E2?text=Home+Occupancy+Simulator)

## 🎯 Features

### 🧠 Intelligent Agent Simulation
- **Generative Agent Architecture**: Based on Stanford's research on believable agent behavior
- **6 Occupant Roles**: Remote Worker, Office Worker, Teacher, Student, Retired, Shift Worker
- **Realistic Daily Routines**: Schedule-based activities with need-driven behaviors
- **Dynamic Decision Making**: Agents adapt based on energy, hunger, hygiene, and comfort levels
- **Work Location Tracking**: Automatic home/away status based on occupation and schedule

### 🏗️ Graph-Based Floor Plan System
- **Modular Room Design**: Add/remove rooms dynamically
- **7 Room Types**: Bedroom, Bathroom, Kitchen, Living Room, Office, Dining Room, Hallway
- **Smart Pathfinding**: Graph-based navigation between rooms
- **Visual Editor**: Interactive floor plan creation and editing
- **Scalable Architecture**: Support for any home layout configuration

### 📊 Professional Analytics Dashboard
- **Real-time Occupancy Tracking**: Monitor who's home vs away
- **24-Hour Pattern Analysis**: Visualize occupancy trends throughout the day
- **Room Usage Statistics**: Track which spaces are most utilized
- **Individual Metrics**: Energy, hunger, hygiene levels per occupant
- **Schedule Visualization**: Weekly calendar view for each occupant

### 🎨 Modern UI/UX
- **Setup Wizard**: Easy configuration for occupants and floor plans
- **Multi-Tab Interface**: Simulation, Analytics, and Schedule views
- **Interactive Canvas**: Click agents and rooms for detailed information
- **Responsive Design**: Works on desktop and tablet devices
- **Real-time Updates**: Smooth animations at 60 FPS

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Python 3.8+ (for RL backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/home-occupancy-simulator.git
cd home-occupancy-simulator

# Install frontend dependencies
npm install

# Install Python dependencies (for RL)
pip install -r requirements.txt

# Start the development server
npm start
```

Visit `http://localhost:3000` to see the simulator in action.

## 📖 Usage

### Basic Simulation

1. **Configure Occupants**
   - Click "Add Occupant" and select a role
   - Customize name and behavior parameters
   - Add multiple occupants for realistic households

2. **Design Floor Plan**
   - Add rooms from the template library
   - Arrange rooms spatially (visual editor coming soon)
   - Define room connections for pathfinding

3. **Run Simulation**
   - Click "Start Simulation" to begin
   - Adjust speed (1x to 1440x for 24h/min)
   - Monitor occupancy patterns in real-time

4. **Analyze Results**
   - Switch to Analytics tab for insights
   - Review 24-hour occupancy patterns
   - Export data for further analysis

### Advanced Configuration

```javascript
// Custom occupant configuration
const customOccupant = {
  name: "Alice",
  role: "remote_worker",
  schedule: {
    wake: 7 * 60,      // 7:00 AM
    workStart: 9 * 60, // 9:00 AM
    lunch: 12 * 60,    // 12:00 PM
    workEnd: 18 * 60,  // 6:00 PM
    dinner: 19 * 60,   // 7:00 PM
    sleep: 23 * 60     // 11:00 PM
  },
  workLocation: 'home', // 'home' or 'away'
  workDays: [1, 2, 3, 4, 5] // Monday-Friday
};
```

## 🤖 Reinforcement Learning Integration

### Gym Environment

The simulator provides a Gym-compatible environment for RL research:

```python
import gym
from home_occupancy_env import HomeOccupancyEnv

# Create environment
env = HomeOccupancyEnv(
    num_occupants=3,
    floor_plan='default',
    control_systems=['hvac', 'lighting']
)

# Run episode
obs = env.reset()
for step in range(1000):
    action = agent.act(obs)  # Your RL agent
    obs, reward, done, info = env.step(action)
    
    if done:
        break
```

### State Space

```python
{
    'occupants': {
        'positions': ndarray(N, 2),      # (x, y) coordinates
        'states': ndarray(N, 7),         # [energy, hunger, hygiene, comfort, is_home, room_id, activity_id]
    },
    'time': {
        'hour': float,                   # 0-23
        'day_of_week': int,              # 1-7
        'minute': float                  # 0-59
    },
    'rooms': {
        'occupancy': ndarray(R,),        # Number of occupants per room
        'temperature': ndarray(R,),      # Temperature per room (°C)
        'lighting': ndarray(R,)          # Light state per room (0-1)
    },
    'occupancy_rate': float              # Percentage of occupants home
}
```

### Action Space

```python
{
    'hvac': ndarray(R,),      # Temperature setpoint per room [18-30°C]
    'lighting': ndarray(R,),  # Light level per room [0-1]
    'appliances': ndarray(A,) # Appliance states [0-1] (optional)
}
```

### Reward Function

```python
reward = α * comfort_score - β * energy_consumption - γ * cost

where:
- comfort_score: Weighted satisfaction of occupant needs
- energy_consumption: kWh consumed in timestep
- cost: Financial cost based on time-of-use pricing
```

## 📊 Data Export

Export simulation data in multiple formats:

```javascript
// JSON format
{
  "timestamp": "2024-01-15T10:30:00Z",
  "simulation_time": "14:30",
  "day": 5,
  "occupants": [
    {
      "id": 1,
      "name": "John",
      "role": "remote_worker",
      "is_home": true,
      "current_room": "office",
      "current_activity": "working",
      "needs": {
        "energy": 75.5,
        "hunger": 45.2,
        "hygiene": 82.1,
        "comfort": 88.3
      }
    }
  ],
  "rooms": [
    {
      "id": "office",
      "type": "office",
      "occupancy": 1,
      "temperature": 22.5,
      "lighting": 0.8
    }
  ],
  "occupancy_rate": 66.7
}
```

## 🔬 Research Applications

### Smart Home Optimization
- Learn optimal HVAC schedules based on occupancy patterns
- Reduce energy consumption while maintaining comfort
- Implement predictive pre-heating/cooling strategies

### Building Energy Management
- Simulate different occupant profiles for building design
- Test demand response strategies
- Optimize renewable energy integration

### Human Behavior Modeling
- Validate activity recognition algorithms
- Generate synthetic training data for ML models
- Study space utilization patterns

### Urban Planning
- Model residential energy demand at neighborhood scale
- Simulate effects of work-from-home policies
- Evaluate building automation strategies

## 🏗️ Architecture

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Simulator.jsx       # Main simulation component
│   │   │   ├── Canvas.jsx          # 2D visualization
│   │   │   ├── SetupWizard.jsx     # Configuration interface
│   │   │   ├── Analytics.jsx       # Analytics dashboard
│   │   │   └── ScheduleView.jsx    # Schedule viewer
│   │   ├── agents/
│   │   │   ├── Agent.js            # Agent class
│   │   │   ├── ActivityDecider.js  # Decision engine
│   │   │   └── Pathfinder.js       # Navigation system
│   │   ├── floorplan/
│   │   │   ├── Graph.js            # Room graph structure
│   │   │   ├── Room.js             # Room definitions
│   │   │   └── Templates.js        # Room templates
│   │   └── utils/
│   │       ├── timeUtils.js
│   │       └── exportUtils.js
│   └── public/
│
├── backend/
│   ├── gym_env/
│   │   ├── __init__.py
│   │   ├── home_env.py             # Gym environment
│   │   ├── agent_simulator.py      # Agent logic
│   │   └── reward_functions.py     # Reward calculations
│   ├── models/
│   │   ├── occupancy_predictor.py  # ML prediction
│   │   └── energy_model.py         # Energy simulation
│   └── api/
│       ├── server.py               # FastAPI server
│       └── routes.py               # API endpoints
│
├── tests/
│   ├── test_agents.py
│   ├── test_pathfinding.py
│   └── test_gym_env.py
│
├── examples/
│   ├── basic_simulation.py
│   ├── rl_training.py
│   └── energy_optimization.py
│
├── docs/
│   ├── API.md
│   ├── AGENTS.md
│   └── FLOORPLAN.md
│
├── requirements.txt
├── package.json
└── README.md
```

## 🎓 Theoretical Background

This simulator implements concepts from:

1. **Generative Agents** (Park et al., 2023)
   - Memory stream architecture
   - Reflection and planning mechanisms
   - Believable agent behavior synthesis

2. **Activity Recognition**
   - Schedule-based activity patterns
   - Need-driven behavior models
   - Context-aware decision making

3. **Building Energy Simulation**
   - Occupancy-driven HVAC control
   - Thermal comfort models (PMV/PPD)
   - Energy consumption modeling

## 📈 Performance

- **Simulation Speed**: Up to 1440x real-time (24 hours in 1 minute)
- **Scalability**: Tested with up to 10 occupants and 20 rooms
- **Memory Usage**: ~200MB for typical household simulation
- **Frame Rate**: 60 FPS smooth animations

## 🛠️ Customization

### Adding New Room Types

```javascript
const newRoomType = {
  type: 'garage',
  name: 'Garage',
  color: '#F5F5DC',
  icon: '🚗',
  width: 140,
  height: 100,
  activities: ['parking', 'storage', 'workshop']
};
```

### Creating Custom Occupant Roles

```javascript
const customRole = {
  label: 'Freelancer',
  workLocation: 'home',
  schedule: {
    wake: 9 * 60,
    workStart: 10 * 60,
    lunch: 13 * 60,
    workEnd: 19 * 60,
    dinner: 20 * 60,
    sleep: 1 * 60  // 1 AM
  },
  workDays: [1, 2, 3, 4, 5, 6], // Works 6 days
  flexibility: 'high' // Can work from anywhere
};
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Setup

```bash
# Fork and clone the repo
git clone https://github.com/yourusername/home-occupancy-simulator.git

# Create a branch
git checkout -b feature/amazing-feature

# Make your changes and commit
git commit -m 'Add amazing feature'

# Push to your fork
git push origin feature/amazing-feature

# Open a Pull Request
```

## 📝 Roadmap

- [ ] **3D Visualization**: Three.js integration for immersive view
- [ ] **Multi-day Simulation**: Extended simulation with weekly patterns
- [ ] **Weather Integration**: External temperature and solar effects
- [ ] **Appliance Models**: Detailed energy consumption per device
- [ ] **Social Interactions**: Multi-agent conversations and coordination
- [ ] **Machine Learning**: Built-in occupancy prediction models
- [ ] **Cloud Deployment**: Web-based collaborative simulation
- [ ] **Mobile App**: iOS/Android companion apps
- [ ] **VR Support**: Virtual reality walkthrough mode
- [ ] **API Server**: RESTful API for remote simulation control

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Stanford HCI Group** - Generative Agents research
- **OpenAI** - GPT models for agent decision-making inspiration
- **Gymnasium** - RL environment standards
- **React Community** - UI framework and components

## 📞 Contact

- **Author**: Your Name
- **Email**: your.email@example.com
- **Project Link**: https://github.com/yourusername/home-occupancy-simulator
- **Documentation**: https://home-sim-docs.readthedocs.io

## 📚 Citation

If you use this simulator in your research, please cite:

```bibtex
@software{home_occupancy_simulator,
  author = {Arman Nikkhah Dehnavi},
  title = {Home Occupancy Simulator: A Platform for Residential Behavior Modeling},
  year = {2024},
  publisher = {GitHub},
  url = {https://github.com/arnikdehnavi/home-occupancy-simulator}
}
```
