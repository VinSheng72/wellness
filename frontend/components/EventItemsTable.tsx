'use client';

import { Package, Plus, Eye } from 'lucide-react';
import { EventItemResponse } from '@/lib/api/types';
import { Button } from '@/components/ui/button';

interface EventItemsTableProps {
  eventItems: EventItemResponse[];
  onViewEvents: (eventItemId: string) => void;
  onCreateNew: () => void;
}

export default function EventItemsTable({
  eventItems,
  onViewEvents,
  onCreateNew,
}: EventItemsTableProps) {
  if (eventItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No event items</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first event item.
        </p>
        <div className="mt-6">
          <Button
            onClick={onCreateNew}
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Create New Item
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create New Button */}
      <div className="flex justify-end">
        <Button
          onClick={onCreateNew}
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Create New Item
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {eventItems.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {item.description || '-'}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <Button
                    onClick={() => onViewEvents(item._id)}
                    variant="link"
                    className="p-0 h-auto"
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    View Events
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
