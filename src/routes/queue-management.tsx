import { 
  getAvailableDestinations, 
  getVehicleQueuesByDestination, 
  getVehicleById, 
  updateQueuePositions,
  getDebugQueueState,
  VehicleQueue
} from "../data/mockData";
import { Button } from "../components/ui/button";
import { 
  Car, 
  Clock, 
  Users, 
  Star, 
  ArrowRight,
  GripVertical,
  RefreshCw,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable queue item component
interface SortableQueueItemProps {
  queue: VehicleQueue;
  getStatusColor: (status: string) => string;
  formatTime: (dateString: string) => string;
}

function SortableQueueItem({ queue, getStatusColor, formatTime }: SortableQueueItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: queue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const vehicle = getVehicleById(queue.vehicleId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 bg-muted rounded-lg transition-all duration-200 ${
        isDragging ? 'opacity-50 shadow-lg scale-105' : 'hover:bg-muted/80'
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center space-x-4 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        
        {/* Position & Type */}
        <div className="text-center">
          <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            {queue.queuePosition}
          </div>
          {queue.queueType === 'OVERNIGHT' && (
            <Star className="h-3 w-3 text-yellow-500 mx-auto mt-1" />
          )}
        </div>

        {/* Vehicle Info */}
        <div className="flex items-center space-x-3">
          <Car className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">{vehicle?.licensePlate}</p>
            <p className="text-sm text-muted-foreground">{vehicle?.driverName}</p>
          </div>
        </div>
      </div>

      {/* Status & Seats */}
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{queue.availableSeats}/{queue.totalSeats}</span>
          </div>
          <p className="text-xs text-muted-foreground">seats available</p>
        </div>

        <div className="text-center">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {queue.estimatedDeparture ? formatTime(queue.estimatedDeparture) : 'TBD'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">est. departure</p>
        </div>

        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(queue.status)}`}>
          {queue.status}
        </div>

        <Button variant="ghost" size="sm">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function QueueManagement() {
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [queueData, setQueueData] = useState<Record<string, VehicleQueue[]>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const destinations = getAvailableDestinations();

  // Initialize queue data
  useEffect(() => {
    refreshQueueData();
  }, []);

  // Refresh queue data from source
  const refreshQueueData = async () => {
    setIsRefreshing(true);
    console.log('🔄 Refreshing queue data...');
    
    // Simulate small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const initialData: Record<string, VehicleQueue[]> = {};
    destinations.forEach(dest => {
      initialData[dest] = getVehicleQueuesByDestination(dest);
    });
    setQueueData(initialData);
    setLastUpdated(new Date());
    setIsRefreshing(false);
    console.log('✅ Queue data refreshed');
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent, destination: string) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const currentQueues = queueData[destination] || [];
    const oldIndex = currentQueues.findIndex(q => q.id === active.id);
    const newIndex = currentQueues.findIndex(q => q.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newQueues = arrayMove(currentQueues, oldIndex, newIndex);
      
      // Update queue positions in the actual data
      const newOrder = newQueues.map(q => q.id);
      console.log(`🔄 Updating queue positions for ${destination}:`, newOrder);
      updateQueuePositions(destination, newOrder);
      
      // Update local state with fresh data from the source
      const updatedQueues = getVehicleQueuesByDestination(destination);
      console.log(`✅ Updated queue data for ${destination}:`, updatedQueues.map(q => ({ id: q.id, position: q.queuePosition, vehicle: q.vehicleId })));
      
      setQueueData(prev => ({
        ...prev,
        [destination]: updatedQueues
      }));

      // Show success feedback and update timestamp
      setLastUpdated(new Date());
      console.log(`🎯 Queue reordered successfully for ${destination}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LOADING': return 'text-blue-500 bg-blue-50';
      case 'WAITING': return 'text-yellow-500 bg-yellow-50';
      case 'READY': return 'text-green-500 bg-green-50';
      case 'DEPARTED': return 'text-gray-500 bg-gray-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <div className="flex items-center space-x-4">
            <p className="text-muted-foreground">Manage vehicle queues by destination - drag to reorder</p>
            {lastUpdated && (
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={refreshQueueData}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Destination Selection */}
      <div className="flex space-x-2">
        <Button 
          variant={selectedDestination === null ? "default" : "outline"}
          onClick={() => setSelectedDestination(null)}
        >
          All Destinations
        </Button>
        {destinations.map(dest => (
          <Button
            key={dest}
            variant={selectedDestination === dest ? "default" : "outline"}
            onClick={() => setSelectedDestination(dest)}
          >
            {dest}
          </Button>
        ))}
      </div>

      {/* Queue Content */}
      <div className="flex-1 space-y-6">
        {destinations
          .filter(dest => selectedDestination === null || dest === selectedDestination)
          .map(destination => {
            const queues = queueData[destination] || [];
            
            return (
              <div key={destination} className="bg-card rounded-lg border p-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-semibold">
                      {destination.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{destination} Queue</h2>
                      <p className="text-sm text-muted-foreground">
                        {queues.length} vehicle{queues.length !== 1 ? 's' : ''} in queue - drag to reorder
                      </p>
                    </div>
                  </div>
                </div>

                {/* Draggable Queue List */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(event, destination)}
                >
                  <SortableContext items={queues.map(q => q.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {queues.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No vehicles in queue for {destination}
                        </div>
                      ) : (
                        queues.map(queue => (
                          <SortableQueueItem
                            key={queue.id}
                            queue={queue}
                            getStatusColor={getStatusColor}
                            formatTime={formatTime}
                          />
                        ))
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            );
          })}
      </div>

      {/* Debug Section */}
      <div className="border-t pt-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs text-muted-foreground"
        >
          {showDebug ? 'Hide' : 'Show'} Debug Info
        </Button>
        
        {showDebug && (
          <div className="mt-2 p-4 bg-muted rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Current Queue State (from mock data):</h3>
            <pre className="text-xs bg-background p-2 rounded overflow-auto">
              {JSON.stringify(getDebugQueueState(), null, 2)}
            </pre>
            <div className="mt-2 flex space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  console.log('🔍 Current debug state:', getDebugQueueState());
                  console.log('🔍 Local component state:', queueData);
                }}
              >
                Log State to Console
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={refreshQueueData}
              >
                Force Refresh
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 