import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'

interface TimeSlot {
  hour: number
  minute: number
}

interface CalendarEntry {
  id: string
  startTime: TimeSlot
  endTime: TimeSlot
  title: string
  color: string
}

interface CalendarGridProps {
  date: Date
  entries: CalendarEntry[]
  onEntryCreate: (entry: Omit<CalendarEntry, 'id'>) => void
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ date, entries, onEntryCreate }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<TimeSlot | null>(null)
  const [dragEnd, setDragEnd] = useState<TimeSlot | null>(null)
  const [currentDragPreview, setCurrentDragPreview] = useState<{ start: TimeSlot; end: TimeSlot } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Generate time slots from 7:00 AM to 6:00 PM
  const timeSlots = []
  for (let hour = 7; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      timeSlots.push({ hour, minute })
    }
  }

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
  }

  const formatTimeShort = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:00 ${period}`
  }

  const getSlotFromPosition = (y: number): TimeSlot => {
    if (!gridRef.current) return { hour: 7, minute: 0 }
    
    const rect = gridRef.current.getBoundingClientRect()
    const relativeY = y - rect.top
    const slotHeight = rect.height / timeSlots.length
    const slotIndex = Math.floor(relativeY / slotHeight)
    
    return timeSlots[Math.max(0, Math.min(slotIndex, timeSlots.length - 1))]
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left click
    
    const startSlot = getSlotFromPosition(e.clientY)
    setIsDragging(true)
    setDragStart(startSlot)
    setDragEnd(startSlot)
    setCurrentDragPreview({ start: startSlot, end: startSlot })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return
    
    const currentSlot = getSlotFromPosition(e.clientY)
    setDragEnd(currentSlot)
    
    // Ensure start is before end
    const start = compareTimeSlots(dragStart, currentSlot) <= 0 ? dragStart : currentSlot
    const end = compareTimeSlots(dragStart, currentSlot) > 0 ? dragStart : currentSlot
    
    setCurrentDragPreview({ start, end })
  }

  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragEnd) return
    
    // Ensure start is before end
    const start = compareTimeSlots(dragStart, dragEnd) <= 0 ? dragStart : dragEnd
    const end = compareTimeSlots(dragStart, dragEnd) > 0 ? dragStart : dragEnd
    
    // Ensure minimum 15-minute duration
    const minEndTime = { 
      hour: start.hour, 
      minute: start.minute + 15 >= 60 ? start.minute + 15 - 60 : start.minute + 15 
    }
    if (minEndTime.minute >= 60) {
      minEndTime.hour += 1
      minEndTime.minute -= 60
    }
    
    const finalEnd = compareTimeSlots(end, minEndTime) < 0 ? minEndTime : end
    
    // Create a new entry
    const newEntry = {
      startTime: start,
      endTime: finalEnd,
      title: 'New Task',
      color: '#3B82F6'
    }
    
    onEntryCreate(newEntry)
    
    // Reset drag state
    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
    setCurrentDragPreview(null)
  }

  const compareTimeSlots = (a: TimeSlot, b: TimeSlot): number => {
    if (a.hour !== b.hour) return a.hour - b.hour
    return a.minute - b.minute
  }

  const getSlotPosition = (slot: TimeSlot) => {
    const slotIndex = timeSlots.findIndex(s => s.hour === slot.hour && s.minute === slot.minute)
    return slotIndex >= 0 ? slotIndex : 0
  }

  const formatDate = (date: Date) => {
    const day = date.getDate()
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
    return `${day} ${dayName}`
  }

  const getDayHours = () => {
    const totalMinutes = entries.reduce((sum, entry) => {
      const startMinutes = entry.startTime.hour * 60 + entry.startTime.minute
      const endMinutes = entry.endTime.hour * 60 + entry.endTime.minute
      return sum + (endMinutes - startMinutes)
    }, 0)
    
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}:${minutes.toString().padStart(2, '0')}:00`
  }

  return (
    <Card className="w-full h-full shadow-xl border-0 bg-white rounded-lg overflow-hidden">
      <CardHeader className="bg-gray-50 border-b p-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span className="text-lg font-medium text-gray-800">
              {formatDate(date)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{getDayHours()}</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 h-full">
        <div className="flex h-full">
          {/* Time column */}
          <div className="w-20 bg-gray-50 border-r border-gray-200 flex flex-col">
            {Array.from({ length: 12 }, (_, i) => i + 7).map(hour => (
              <div key={hour} className="h-12 flex items-start justify-end pr-2 pt-1 text-xs text-gray-500 border-b border-gray-200">
                {formatTimeShort(hour)}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div 
            ref={gridRef}
            className="flex-1 relative select-none bg-white"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (isDragging) handleMouseUp()
            }}
            style={{ cursor: isDragging ? 'grabbing' : 'crosshair' }}
          >
            {/* Grid lines */}
            {timeSlots.map((slot, index) => (
              <div
                key={`${slot.hour}-${slot.minute}`}
                className={`absolute w-full border-gray-200 ${
                  slot.minute === 0 ? 'border-t' : 'border-t border-dashed'
                }`}
                style={{
                  top: `${(index / timeSlots.length) * 100}%`,
                  height: `${(1 / timeSlots.length) * 100}%`
                }}
              />
            ))}
            
            {/* Existing entries */}
            {entries.map(entry => {
              const startPos = getSlotPosition(entry.startTime)
              const endPos = getSlotPosition(entry.endTime)
              const top = (startPos / timeSlots.length) * 100
              const height = ((endPos - startPos + 1) / timeSlots.length) * 100
              
              return (
                <div
                  key={entry.id}
                  className="absolute left-1 right-1 rounded-md shadow-sm border-l-4 bg-opacity-80 px-2 py-1 cursor-pointer hover:bg-opacity-100 transition-all"
                  style={{
                    top: `${top}%`,
                    height: `${height}%`,
                    backgroundColor: entry.color + '20',
                    borderLeftColor: entry.color
                  }}
                >
                  <div className="text-xs font-medium text-gray-800 truncate">
                    {entry.title}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatTime(entry.startTime.hour, entry.startTime.minute)} - {formatTime(entry.endTime.hour, entry.endTime.minute)}
                  </div>
                </div>
              )
            })}
            
            {/* Drag preview */}
            {currentDragPreview && (
              <div
                className="absolute left-1 right-1 rounded-md bg-blue-500 bg-opacity-30 border-l-4 border-blue-500 px-2 py-1 pointer-events-none"
                style={{
                  top: `${(getSlotPosition(currentDragPreview.start) / timeSlots.length) * 100}%`,
                  height: `${((getSlotPosition(currentDragPreview.end) - getSlotPosition(currentDragPreview.start) + 1) / timeSlots.length) * 100}%`
                }}
              >
                <div className="text-xs font-medium text-blue-800">
                  New Task
                </div>
                <div className="text-xs text-blue-700">
                  {formatTime(currentDragPreview.start.hour, currentDragPreview.start.minute)} - {formatTime(currentDragPreview.end.hour, currentDragPreview.end.minute)}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CalendarGrid