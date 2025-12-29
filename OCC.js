import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Users, Clock, Settings, Download, Plus, Trash2, Edit, Home, Activity, TrendingUp, Calendar } from 'lucide-react';

const HomeOccupantSimulator = () => {
  const canvasRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(6 * 60);
  const [currentDay, setCurrentDay] = useState(0);
  const [speed, setSpeed] = useState(60);
  const [occupants, setOccupants] = useState([]);
  const [floorPlan, setFloorPlan] = useState([]);
  const [selectedOccupant, setSelectedOccupant] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showSetup, setShowSetup] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [occupancyHistory, setOccupancyHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('simulation');
  const animationRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  // Graph-based room structure
  const [roomGraph, setRoomGraph] = useState({
    nodes: [],
    edges: []
  });

  // Default room templates
  const roomTemplates = [
    { type: 'bedroom', name: 'Bedroom', color: '#E8F4F8', icon: '🛏️', w: 120, h: 100 },
    { type: 'bathroom', name: 'Bathroom', color: '#F0E8F8', icon: '🚿', w: 80, h: 70 },
    { type: 'kitchen', name: 'Kitchen', color: '#FFF4E8', icon: '🍳', w: 130, h: 110 },
    { type: 'living_room', name: 'Living Room', color: '#E8F8F0', icon: '🛋️', w: 150, h: 120 },
    { type: 'office', name: 'Office', color: '#F8E8E8', icon: '💼', w: 100, h: 90 },
    { type: 'dining', name: 'Dining Room', color: '#F8F8E8', icon: '🍽️', w: 120, h: 100 },
    { type: 'hallway', name: 'Hallway', color: '#F5F5F5', icon: '🚪', w: 80, h: 120 }
  ];

  // Occupant role templates
  const roleTemplates = {
    'remote_worker': {
      label: 'Remote Worker',
      workLocation: 'home',
      schedule: {
        wake: 7 * 60,
        workStart: 9 * 60,
        lunch: 12 * 60,
        workEnd: 18 * 60,
        dinner: 19 * 60,
        sleep: 23 * 60
      },
      workDays: [1, 2, 3, 4, 5]
    },
    'office_worker': {
      label: 'Office Worker',
      workLocation: 'away',
      schedule: {
        wake: 6.5 * 60,
        workStart: 8 * 60,
        lunch: 12.5 * 60,
        workEnd: 17 * 60,
        dinner: 18.5 * 60,
        sleep: 22.5 * 60
      },
      workDays: [1, 2, 3, 4, 5]
    },
    'teacher': {
      label: 'Teacher',
      workLocation: 'away',
      schedule: {
        wake: 6 * 60,
        workStart: 7.5 * 60,
        lunch: 12 * 60,
        workEnd: 16 * 60,
        dinner: 18 * 60,
        sleep: 22 * 60
      },
      workDays: [1, 2, 3, 4, 5]
    },
    'student': {
      label: 'Student',
      workLocation: 'away',
      schedule: {
        wake: 7 * 60,
        workStart: 8 * 60,
        lunch: 12 * 60,
        workEnd: 15 * 60,
        dinner: 18 * 60,
        sleep: 21 * 60
      },
      workDays: [1, 2, 3, 4, 5]
    },
    'retired': {
      label: 'Retired',
      workLocation: 'home',
      schedule: {
        wake: 7.5 * 60,
        workStart: null,
        lunch: 12.5 * 60,
        workEnd: null,
        dinner: 18.5 * 60,
        sleep: 22 * 60
      },
      workDays: []
    },
    'shift_worker': {
      label: 'Shift Worker',
      workLocation: 'away',
      schedule: {
        wake: 5 * 60,
        workStart: 6 * 60,
        lunch: 11 * 60,
        workEnd: 14 * 60,
        dinner: 17 * 60,
        sleep: 21 * 60
      },
      workDays: [1, 2, 3, 4, 5, 6, 7]
    }
  };

  // Initialize default floor plan
  useEffect(() => {
    if (floorPlan.length === 0) {
      const defaultPlan = [
        { id: 'br1', type: 'bedroom', name: 'Master Bedroom', x: 50, y: 50, w: 150, h: 120, color: '#E8F4F8' },
        { id: 'br2', type: 'bedroom', name: 'Bedroom 2', x: 220, y: 50, w: 130, h: 120, color: '#E8F4F8' },
        { id: 'bath1', type: 'bathroom', name: 'Bathroom 1', x: 370, y: 50, w: 80, h: 60, color: '#F0E8F8' },
        { id: 'bath2', type: 'bathroom', name: 'Bathroom 2', x: 370, y: 130, w: 80, h: 60, color: '#F0E8F8' },
        { id: 'kitchen', type: 'kitchen', name: 'Kitchen', x: 50, y: 190, w: 150, h: 140, color: '#FFF4E8' },
        { id: 'living', type: 'living_room', name: 'Living Room', x: 220, y: 190, w: 230, h: 140, color: '#E8F8F0' },
        { id: 'hall', type: 'hallway', name: 'Hallway', x: 200, y: 50, w: 20, h: 280, color: '#F5F5F5' }
      ];
      setFloorPlan(defaultPlan);
      buildRoomGraph(defaultPlan);
    }
  }, []);

  // Build graph from floor plan
  const buildRoomGraph = (plan) => {
    const nodes = plan.map(room => ({
      id: room.id,
      x: room.x + room.w / 2,
      y: room.y + room.h / 2,
      type: room.type
    }));

    const edges = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.sqrt(
          Math.pow(nodes[i].x - nodes[j].x, 2) + 
          Math.pow(nodes[i].y - nodes[j].y, 2)
        );
        if (dist < 200) {
          edges.push({ from: nodes[i].id, to: nodes[j].id, weight: dist });
        }
      }
    }

    setRoomGraph({ nodes, edges });
  };

  // Add new occupant
  const addOccupant = (role) => {
    const colors = ['#4A90E2', '#E24A90', '#90E24A', '#E2904A', '#904AE2', '#4AE290'];
    const newOccupant = {
      id: Date.now(),
      name: `Occupant ${occupants.length + 1}`,
      role,
      ...roleTemplates[role],
      x: 260,
      y: 250,
      currentRoom: 'living',
      currentActivity: 'idle',
      targetRoom: null,
      path: [],
      energy: 80,
      hunger: 30,
      hygiene: 80,
      comfort: 70,
      isHome: true,
      color: colors[occupants.length % colors.length]
    };
    setOccupants([...occupants, newOccupant]);
  };

  // Remove occupant
  const removeOccupant = (id) => {
    setOccupants(occupants.filter(o => o.id !== id));
    if (selectedOccupant?.id === id) setSelectedOccupant(null);
  };

  // Add room to floor plan
  const addRoom = (template) => {
    const newRoom = {
      id: `room_${Date.now()}`,
      type: template.type,
      name: `${template.name} ${floorPlan.filter(r => r.type === template.type).length + 1}`,
      x: 50 + (floorPlan.length * 30) % 300,
      y: 50 + Math.floor(floorPlan.length / 10) * 30,
      w: template.w,
      h: template.h,
      color: template.color
    };
    const newPlan = [...floorPlan, newRoom];
    setFloorPlan(newPlan);
    buildRoomGraph(newPlan);
  };

  // Remove room
  const removeRoom = (id) => {
    const newPlan = floorPlan.filter(r => r.id !== id);
    setFloorPlan(newPlan);
    buildRoomGraph(newPlan);
    if (selectedRoom?.id === id) setSelectedRoom(null);
  };

  // Calculate home occupancy
  const calculateOccupancy = () => {
    const atHome = occupants.filter(o => o.isHome).length;
    return {
      total: occupants.length,
      home: atHome,
      away: occupants.length - atHome,
      percentage: occupants.length > 0 ? (atHome / occupants.length) * 100 : 0
    };
  };

  // Decide activity based on role and schedule
  const decideActivity = (occupant, time, dayOfWeek) => {
    const schedule = occupant.schedule;
    
    // Check if it's a work day
    const isWorkDay = occupant.workDays.includes(dayOfWeek);
    
    // Sleeping
    if (time < schedule.wake || time >= schedule.sleep) {
      const bedroomRoom = floorPlan.find(r => r.type === 'bedroom');
      return { activity: 'sleeping', room: bedroomRoom?.id, isHome: true };
    }

    // Morning routine
    if (time >= schedule.wake && time < schedule.wake + 15) {
      const bedroomRoom = floorPlan.find(r => r.type === 'bedroom');
      return { activity: 'waking_up', room: bedroomRoom?.id, isHome: true };
    }

    if (time >= schedule.wake + 15 && time < schedule.wake + 30) {
      const bathroomRoom = floorPlan.find(r => r.type === 'bathroom');
      return { activity: 'showering', room: bathroomRoom?.id, isHome: true };
    }

    if (time >= schedule.wake + 30 && time < schedule.wake + 60) {
      const kitchenRoom = floorPlan.find(r => r.type === 'kitchen');
      return { activity: 'breakfast', room: kitchenRoom?.id, isHome: true };
    }

    // Work hours
    if (isWorkDay && schedule.workStart && time >= schedule.workStart && time < schedule.lunch) {
      if (occupant.workLocation === 'home') {
        const officeRoom = floorPlan.find(r => r.type === 'office') || floorPlan.find(r => r.type === 'bedroom');
        return { activity: 'working', room: officeRoom?.id, isHome: true };
      } else {
        return { activity: 'at_work', room: null, isHome: false };
      }
    }

    // Lunch
    if (time >= schedule.lunch && time < schedule.lunch + 45) {
      if (occupant.isHome) {
        const kitchenRoom = floorPlan.find(r => r.type === 'kitchen');
        return { activity: 'lunch', room: kitchenRoom?.id, isHome: true };
      } else {
        return { activity: 'at_work', room: null, isHome: false };
      }
    }

    // Afternoon work
    if (isWorkDay && schedule.workEnd && time > schedule.lunch + 45 && time < schedule.workEnd) {
      if (occupant.workLocation === 'home') {
        const officeRoom = floorPlan.find(r => r.type === 'office') || floorPlan.find(r => r.type === 'bedroom');
        return { activity: 'working', room: officeRoom?.id, isHome: true };
      } else {
        return { activity: 'at_work', room: null, isHome: false };
      }
    }

    // Evening activities
    if (time >= (schedule.workEnd || schedule.lunch + 180) && time < schedule.dinner) {
      const livingRoom = floorPlan.find(r => r.type === 'living_room');
      return { activity: 'relaxing', room: livingRoom?.id, isHome: true };
    }

    if (time >= schedule.dinner && time < schedule.dinner + 60) {
      const kitchenRoom = floorPlan.find(r => r.type === 'kitchen');
      return { activity: 'dinner', room: kitchenRoom?.id, isHome: true };
    }

    // Night activities
    if (time > schedule.dinner + 60 && time < schedule.sleep) {
      const livingRoom = floorPlan.find(r => r.type === 'living_room');
      return { activity: 'watching_tv', room: livingRoom?.id, isHome: true };
    }

    // Default
    const livingRoom = floorPlan.find(r => r.type === 'living_room');
    return { activity: 'idle', room: livingRoom?.id, isHome: true };
  };

  // Pathfinding using graph
  const findPath = (fromRoomId, toRoomId) => {
    if (!toRoomId || fromRoomId === toRoomId) return [];
    
    const fromNode = roomGraph.nodes.find(n => n.id === fromRoomId);
    const toNode = roomGraph.nodes.find(n => n.id === toRoomId);
    
    if (!fromNode || !toNode) return [];

    // Simple direct path for now
    return [
      { x: fromNode.x, y: fromNode.y },
      { x: toNode.x, y: toNode.y }
    ];
  };

  // Move occupant
  const moveOccupant = (occupant) => {
    if (!occupant.path || occupant.path.length === 0) return occupant;
    
    const target = occupant.path[0];
    const dx = target.x - occupant.x;
    const dy = target.y - occupant.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 5) {
      const newPath = [...occupant.path];
      newPath.shift();
      
      if (newPath.length === 0 && occupant.targetRoom) {
        return {
          ...occupant,
          currentRoom: occupant.targetRoom,
          targetRoom: null,
          path: []
        };
      }
      
      return { ...occupant, path: newPath };
    }
    
    const speed = 2;
    const ratio = speed / distance;
    
    return {
      ...occupant,
      x: occupant.x + dx * ratio,
      y: occupant.y + dy * ratio
    };
  };

  // Update simulation
  const updateSimulation = () => {
    const now = Date.now();
    const deltaTime = (now - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = now;
    
    if (!isRunning) return;
    
    const deltaMinutes = deltaTime * speed;
    setCurrentTime(prev => {
      const newTime = prev + deltaMinutes;
      if (newTime >= 24 * 60) {
        setCurrentDay(d => d + 1);
        return 0;
      }
      return newTime;
    });

    // Track occupancy every hour
    if (Math.floor(currentTime / 60) !== Math.floor((currentTime - deltaMinutes) / 60)) {
      const occ = calculateOccupancy();
      setOccupancyHistory(prev => [...prev.slice(-23), {
        time: currentTime,
        day: currentDay,
        ...occ
      }]);
    }
    
    setOccupants(prevOccupants => {
      return prevOccupants.map(occupant => {
        let updated = { ...occupant };
        
        // Update needs
        updated.energy = Math.max(0, Math.min(100, 
          updated.currentActivity === 'sleeping' ? updated.energy + 0.3 : updated.energy - 0.05
        ));
        updated.hunger = Math.min(100, updated.hunger + 0.08);
        updated.hygiene = Math.max(0, updated.hygiene - 0.05);
        
        if (['breakfast', 'lunch', 'dinner'].includes(updated.currentActivity)) {
          updated.hunger = Math.max(0, updated.hunger - 2);
        }
        if (updated.currentActivity === 'showering') {
          updated.hygiene = Math.min(100, updated.hygiene + 3);
        }
        
        // Decide activity
        if (!updated.path || updated.path.length === 0) {
          const dayOfWeek = (currentDay % 7) + 1;
          const decision = decideActivity(updated, currentTime, dayOfWeek);
          
          updated.isHome = decision.isHome;
          
          if (decision.room && decision.room !== updated.currentRoom) {
            updated.targetRoom = decision.room;
            updated.path = findPath(updated.currentRoom, decision.room);
            updated.currentActivity = 'moving';
          } else if (decision.activity !== updated.currentActivity) {
            updated.currentActivity = decision.activity;
          }
        } else {
          updated = moveOccupant(updated);
        }
        
        return updated;
      });
    });
  };

  // Animation loop
  useEffect(() => {
    const animate = () => {
      updateSimulation();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (isRunning) {
      lastUpdateRef.current = Date.now();
      animate();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, currentTime, speed, occupants, floorPlan]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Draw grid
    ctx.strokeStyle = '#E9ECEF';
    ctx.lineWidth = 1;
    for (let i = 0; i < rect.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, rect.height);
      ctx.stroke();
    }
    for (let i = 0; i < rect.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(rect.width, i);
      ctx.stroke();
    }
    
    // Draw rooms
    floorPlan.forEach(room => {
      ctx.fillStyle = room.color;
      ctx.fillRect(room.x, room.y, room.w, room.h);
      
      ctx.strokeStyle = selectedRoom?.id === room.id ? '#4A90E2' : '#ADB5BD';
      ctx.lineWidth = selectedRoom?.id === room.id ? 3 : 2;
      ctx.strokeRect(room.x, room.y, room.w, room.h);
      
      ctx.fillStyle = '#495057';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(room.name, room.x + room.w / 2, room.y + room.h / 2 - 5);
      
      const template = roomTemplates.find(t => t.type === room.type);
      if (template) {
        ctx.font = '20px sans-serif';
        ctx.fillText(template.icon, room.x + room.w / 2, room.y + room.h / 2 + 15);
      }
    });
    
    // Draw occupants
    occupants.forEach(occupant => {
      if (!occupant.isHome) return;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.ellipse(occupant.x, occupant.y + 14, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = occupant.color;
      ctx.beginPath();
      ctx.arc(occupant.x, occupant.y, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = selectedOccupant?.id === occupant.id ? '#FFD700' : '#FFFFFF';
      ctx.lineWidth = selectedOccupant?.id === occupant.id ? 3 : 2;
      ctx.stroke();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(occupant.name.charAt(0), occupant.x, occupant.y + 4);
      
      ctx.fillStyle = '#212529';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(occupant.name, occupant.x, occupant.y - 18);
    });
    
  }, [occupants, floorPlan, selectedOccupant, selectedRoom, editMode]);

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const formatDay = (day) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[day % 7];
  };

  const occupancy = calculateOccupancy();

  if (showSetup) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Home Occupancy Simulator Setup</h1>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Occupants Setup */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users size={24} className="text-blue-600" />
                Configure Occupants
              </h2>
              
              <div className="space-y-3 mb-4">
                {occupants.map(occ => (
                  <div key={occ.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <input
                        type="text"
                        value={occ.name}
                        onChange={(e) => setOccupants(occupants.map(o => 
                          o.id === occ.id ? {...o, name: e.target.value} : o
                        ))}
                        className="font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
                      />
                      <div className="text-sm text-gray-600">{roleTemplates[occ.role].label}</div>
                    </div>
                    <button
                      onClick={() => removeOccupant(occ.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Add Occupant:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(roleTemplates).map(([key, role]) => (
                    <button
                      key={key}
                      onClick={() => addOccupant(key)}
                      className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition"
                    >
                      + {role.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Floor Plan Setup */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Home size={24} className="text-green-600" />
                Configure Floor Plan
              </h2>
              
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {floorPlan.map(room => (
                  <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{roomTemplates.find(t => t.type === room.type)?.icon}</span>
                      <div>
                        <div className="font-semibold">{room.name}</div>
                        <div className="text-xs text-gray-600">{room.type}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeRoom(room.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Add Room:</p>
                <div className="grid grid-cols-2 gap-2">
                  {roomTemplates.map(template => (
                    <button
                      key={template.type}
                      onClick={() => addRoom(template)}
                      className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                    >
                      <span>{template.icon}</span>
                      <span>{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => {
                if (occupants.length === 0 || floorPlan.length === 0) {
                  alert('Please add at least one occupant and one room');
                  return;
                }
                setShowSetup(false);
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition"
            >
              Start Simulation →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Home className="text-blue-600" size={28} />
              Home Occupancy Simulator
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-200">
                <Clock size={20} className="text-blue-600" />
                <div className="font-mono text-lg font-bold text-blue-900">
                  {formatTime(currentTime)}
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-lg border border-purple-200">
                <Calendar size={20} className="text-purple-600" />
                <div className="text-sm font-semibold text-purple-900">
                  Day {currentDay + 1} - {formatDay(currentDay)}
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg border border-green-200">
                <Users size={20} className="text-green-600" />
                <div className="text-sm font-semibold text-green-900">
                  {occupancy.home}/{occupancy.total} Home ({occupancy.percentage.toFixed(0)}%)
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-5 py-2.5 rounded-lg font-semibold shadow-lg transition flex items-center gap-2 ${
                isRunning 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isRunning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Play</>}
            </button>
            
            <button
              onClick={() => {
                setIsRunning(false);
                setCurrentTime(6 * 60);
                setCurrentDay(0);
                setOccupancyHistory([]);
                setLogs([]);
              }}
              className="px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold shadow-lg transition flex items-center gap-2"
            >
              <RotateCcw size={18} />
            </button>
            
            <button
              onClick={() => setShowSetup(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg transition flex items-center gap-2"
            >
              <Settings size={18} />
            </button>
            
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>Real-time</option>
              <option value={60}>60x</option>
              <option value={300}>300x</option>
              <option value={600}>600x</option>
              <option value={1440}>24h/min</option>
            </select>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'simulation'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Simulation View
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'analytics'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'schedule'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Schedules
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      {activeTab === 'simulation' && (
        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const clickedOcc = occupants.find(o => {
                  if (!o.isHome) return false;
                  const dx = o.x - x;
                  const dy = o.y - y;
                  return Math.sqrt(dx * dx + dy * dy) < 15;
                });
                
                if (clickedOcc) {
                  setSelectedOccupant(clickedOcc);
                  setSelectedRoom(null);
                  return;
                }
                
                const clickedRoom = floorPlan.find(r => 
                  x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h
                );
                
                if (clickedRoom) {
                  setSelectedRoom(clickedRoom);
                  setSelectedOccupant(null);
                }
              }}
            />
          </div>
          
          <div className="w-80 flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex-1 overflow-auto">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-800">
                <Users size={20} className="text-blue-600" />
                Occupants ({occupants.length})
              </h2>
              
              <div className="space-y-3">
                {occupants.map(occ => (
                  <div
                    key={occ.id}
                    onClick={() => setSelectedOccupant(occ)}
                    className={`p-3 rounded-lg cursor-pointer transition border-2 ${
                      selectedOccupant?.id === occ.id
                        ? 'bg-blue-50 border-blue-400 shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: occ.color }}
                        />
                        <span className="font-bold text-gray-800">{occ.name}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        occ.isHome ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {occ.isHome ? '🏠 Home' : '🚗 Away'}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1 mb-2">
                      <div><strong>Role:</strong> {roleTemplates[occ.role].label}</div>
                      <div><strong>Activity:</strong> {occ.currentActivity.replace(/_/g, ' ')}</div>
                      {occ.isHome && <div><strong>Location:</strong> {floorPlan.find(r => r.id === occ.currentRoom)?.name}</div>}
                    </div>
                    
                    <div className="space-y-1">
                      {[
                        { label: 'Energy', value: occ.energy, color: 'bg-green-500' },
                        { label: 'Hunger', value: occ.hunger, color: 'bg-orange-500' },
                        { label: 'Hygiene', value: occ.hygiene, color: 'bg-blue-500' }
                      ].map(need => (
                        <div key={need.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">{need.label}</span>
                            <span className="font-semibold">{need.value.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${need.color} h-2 rounded-full transition-all`}
                              style={{ width: `${need.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'analytics' && (
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="text-blue-600" />
                Occupancy Analytics
              </h2>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600 font-semibold">Total Occupants</div>
                  <div className="text-3xl font-bold text-blue-900">{occupancy.total}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 font-semibold">Currently Home</div>
                  <div className="text-3xl font-bold text-green-900">{occupancy.home}</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                  <div className="text-sm text-red-600 font-semibold">Currently Away</div>
                  <div className="text-3xl font-bold text-red-900">{occupancy.away}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-600 font-semibold">Occupancy Rate</div>
                  <div className="text-3xl font-bold text-purple-900">{occupancy.percentage.toFixed(0)}%</div>
                </div>
              </div>
              
              {occupancyHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">24h Occupancy Pattern</h3>
                  <div className="flex items-end gap-1 h-32">
                    {occupancyHistory.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition"
                        style={{ height: `${point.percentage}%` }}
                        title={`${formatTime(point.time)}: ${point.home}/${point.total} home`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>0:00</span>
                    <span>6:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>24:00</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Room Usage</h2>
              <div className="grid grid-cols-3 gap-4">
                {floorPlan.map(room => {
                  const occupantsInRoom = occupants.filter(o => o.isHome && o.currentRoom === room.id).length;
                  const template = roomTemplates.find(t => t.type === room.type);
                  
                  return (
                    <div key={room.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{template?.icon}</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          occupantsInRoom > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {occupantsInRoom} {occupantsInRoom === 1 ? 'person' : 'people'}
                        </span>
                      </div>
                      <div className="font-semibold text-gray-800">{room.name}</div>
                      <div className="text-xs text-gray-600">{room.type}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'schedule' && (
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="text-blue-600" />
                Daily Schedules
              </h2>
              
              <div className="space-y-6">
                {occupants.map(occ => (
                  <div key={occ.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: occ.color }} />
                      <div>
                        <div className="font-bold text-lg">{occ.name}</div>
                        <div className="text-sm text-gray-600">{roleTemplates[occ.role].label}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 text-xs">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                        <div
                          key={day}
                          className={`p-2 rounded text-center font-semibold ${
                            occ.workDays.includes(idx + 1)
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold w-24">Wake:</span>
                        <span>{formatTime(occ.schedule.wake)}</span>
                      </div>
                      {occ.schedule.workStart && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold w-24">Work Start:</span>
                            <span>{formatTime(occ.schedule.workStart)}</span>
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                              occ.workLocation === 'home' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {occ.workLocation === 'home' ? 'Work from Home' : 'Office/Away'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold w-24">Work End:</span>
                            <span>{formatTime(occ.schedule.workEnd)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-semibold w-24">Sleep:</span>
                        <span>{formatTime(occ.schedule.sleep)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeOccupantSimulator;
