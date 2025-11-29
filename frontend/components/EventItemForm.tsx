'use client';

import { useState, FormEvent } from 'react';
import { CreateEventItemRequest } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ErrorMessage } from '@/components/ui/error-message';

interface EventItemFormProps {
  onSubmit: (data: CreateEventItemRequest) => Promise<void>;
  onCancel: () => void;
}

export default function EventItemForm({ onSubmit, onCancel }: EventItemFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    if (name.length > 200) {
      setError('Name must be 200 characters or less');
      return false;
    }

    if (description && description.length > 1000) {
      setError('Description must be 1000 characters or less');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data: CreateEventItemRequest = {
        name: name.trim(),
      };

      if (description.trim()) {
        data.description = description.trim();
      }

      await onSubmit(data);

      setName('');
      setDescription('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create event item';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          className="mt-1"
          required
        />
        <p className="mt-1 text-xs text-gray-500">{name.length}/200 characters</p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={4}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-gray-500">{description.length}/1000 characters</p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Creating...' : 'Create Event Item'}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          variant="secondary"
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
