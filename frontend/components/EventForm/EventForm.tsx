'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorMessage } from '@/components/ui/error-message';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { validateEventForm } from './validation';
import { parseSubmissionError } from './errors';

type EventItem = {
  _id: string;
  name: string;
  vendorId: string;
  description?: string;
};

import { apiClient } from '@/lib/api';

type EventFormProps = {
  mode?: 'create' | 'edit';
  initialData?: {
    _id: string;
    eventItemId: string;
    proposedDates: string[];
    location: {
      postalCode: string;
      streetName: string;
    };
  };
  onEventCreated?: () => void;
  onEventUpdated?: () => void;
};

export default function EventForm({ 
  mode = 'create',
  initialData,
  onEventCreated, 
  onEventUpdated 
}: EventFormProps) {
  const { showToast } = useToast();
  const isEditMode = mode === 'edit';
  
  const [formData, setFormData] = useState({
    selectedEventItem: isEditMode && initialData ? initialData.eventItemId : '',
    proposedDates: isEditMode && initialData 
      ? initialData.proposedDates.map(date => new Date(date))
      : [undefined, undefined, undefined] as (Date | undefined)[],
    postalCode: isEditMode && initialData ? initialData.location.postalCode : '',
    streetName: isEditMode && initialData ? initialData.location.streetName : '',
  });

  const [uiState, setUiState] = useState({
    isLookingUp: false,
    isSubmitting: false,
    error: '',
  });

  const [dataState, setDataState] = useState({
    eventItems: [] as EventItem[],
    isLoadingItems: true,
  });

  useEffect(() => {
    const fetchEventItems = async () => {
      try {
        const data = await apiClient.getEventItems();
        
        // In edit mode, show all items; in create mode, filter to available items only
        const eventItems = isEditMode 
          ? data 
          : data.filter(item => !item.hasApprovedEvent);
        
        setDataState(prev => ({ ...prev, eventItems }));
      } catch (err) {
        console.error('Failed to fetch event items:', err);
        showToast('Failed to load event types', 'error');
      } finally {
        setDataState(prev => ({ ...prev, isLoadingItems: false }));
      }
    };

    fetchEventItems();
  }, [showToast, isEditMode]);

  const handlePostalCodeLookup = async () => {
    if (!formData.postalCode.trim()) {
      showToast('Please enter a postal code first', 'warning');
      return;
    }

    setUiState(prev => ({ ...prev, isLookingUp: true }));
    try {
      const data = await apiClient.lookupPostalCode(formData.postalCode.trim());
      if (data && data.streetName) {
        setFormData(prev => ({ ...prev, streetName: data.streetName }));
        showToast('Street name found!', 'success');
      } else {
        showToast('No street name found. Please enter manually.', 'info');
      }
    } catch (err) {
      console.error('Postal code lookup failed:', err);
      showToast('Postal code lookup unavailable. Please enter street name manually.', 'warning');
    } finally {
      setUiState(prev => ({ ...prev, isLookingUp: false }));
    }
  };

  const handleDateChange = (index: number, date: Date | undefined) => {
    setFormData(prev => {
      const newDates = [...prev.proposedDates];
      newDates[index] = date;
      return { ...prev, proposedDates: newDates };
    });
  };

  const validateForm = (): boolean => {
    const validationResult = validateEventForm(formData);

    if (!validationResult.isValid) {
      const errorMsg = validationResult.error || 'Validation failed';
      setUiState(prev => ({ ...prev, error: errorMsg }));
      showToast(errorMsg, 'warning');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUiState(prev => ({ ...prev, error: '' }));

    if (!validateForm()) {
      return;
    }

    setUiState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const eventPayload = {
        proposedDates: formData.proposedDates
          .filter((date): date is Date => date !== undefined)
          .map((date) => date.toISOString()),
        location: {
          postalCode: formData.postalCode.trim(),
          streetName: formData.streetName.trim(),
        },
      };

      if (isEditMode && initialData) {
        await apiClient.updateEvent(initialData._id, eventPayload);
        showToast('Event updated successfully!', 'success');
        onEventUpdated?.();
      } else {
        await apiClient.createEvent({
          eventItemId: formData.selectedEventItem,
          ...eventPayload,
        });
        showToast('Event created successfully!', 'success');
        
        // Reset form after successful creation
        setFormData({
          selectedEventItem: '',
          proposedDates: [undefined, undefined, undefined],
          postalCode: '',
          streetName: '',
        });
        setUiState(prev => ({ ...prev, error: '' }));
        
        onEventCreated?.();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred. Please try again.');
      const parsedError = parseSubmissionError({ mode, error });
      
      if (parsedError.shouldShowToast) {
        showToast(parsedError.message, 'error');
      }
      
      if (parsedError.shouldSetInlineError) {
        setUiState(prev => ({ ...prev, error: parsedError.message }));
      }
      
      if (parsedError.shouldClearEventItem) {
        setFormData(prev => ({ ...prev, selectedEventItem: '' }));
      }
      
    } finally {
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Type <span className="text-red-500">*</span>
          {isEditMode && (
            <span className="ml-2 text-xs text-gray-500">(cannot be changed)</span>
          )}
        </label>
        <Select
          value={formData.selectedEventItem}
          onValueChange={(value) => setFormData(prev => ({ ...prev, selectedEventItem: value }))}
          disabled={dataState.isLoadingItems || isEditMode}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={dataState.isLoadingItems ? 'Loading event types...' : 'Select an event type'} />
          </SelectTrigger>
          <SelectContent>
            {dataState.eventItems.map((item) => (
              <SelectItem key={item._id} value={item._id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Proposed Dates (3 required) <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index}>
              <label className="block text-xs text-gray-600 mb-1">
                Date {index + 1}
              </label>
              <DatePicker
                date={formData.proposedDates[index]}
                onDateChange={(date) => handleDateChange(index, date)}
                minDate={new Date()}
                placeholder={`Select date ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Location <span className="text-red-500">*</span>
        </label>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              id="postalCode"
              type="text"
              placeholder="Postal Code"
              value={formData.postalCode}
              onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
              required
            />
          </div>
          <Button
            type="button"
            onClick={handlePostalCodeLookup}
            disabled={uiState.isLookingUp || !formData.postalCode.trim()}
            variant="secondary"
          >
            {uiState.isLookingUp ? 'Looking up...' : 'Lookup'}
          </Button>
        </div>

        <div>
          <Input
            id="streetName"
            type="text"
            placeholder="Street Name"
            value={formData.streetName}
            onChange={(e) => setFormData(prev => ({ ...prev, streetName: e.target.value }))}
            required
          />
        </div>
      </div>

      {uiState.error && <ErrorMessage message={uiState.error} />}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={uiState.isSubmitting}
        className="w-full"
      >
        {uiState.isSubmitting 
          ? (isEditMode ? 'Updating Event...' : 'Creating Event...')
          : (isEditMode ? 'Update Event' : 'Create Event')
        }
      </Button>
    </form>
  );
}
