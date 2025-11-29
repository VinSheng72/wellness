import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

/**
 * Standard success response for GET operations
 */
export function ApiGetResponse(type: Type<any> | [Type<any>]) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Success',
      type,
    }),
  );
}

/**
 * Standard success response for POST operations (create)
 */
export function ApiCreateResponse(type: Type<any>) {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: 'Created successfully',
      type,
    }),
  );
}

/**
 * Standard success response for PUT/PATCH operations (update)
 */
export function ApiUpdateResponse(type: Type<any>) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Updated successfully',
      type,
    }),
  );
}

/**
 * Common error responses for operations that require resource lookup
 */
export function ApiResourceErrors() {
  return applyDecorators(
    ApiForbiddenResponse({ description: 'Forbidden - Not authorized' }),
    ApiNotFoundResponse({ description: 'Resource not found' }),
  );
}

/**
 * Common error responses for create/update operations
 */
export function ApiValidationErrors() {
  return applyDecorators(
    ApiBadRequestResponse({ description: 'Bad Request - Validation failed' }),
  );
}

/**
 * Complete set of responses for a standard GET by ID operation
 */
export function ApiGetByIdResponses(type: Type<any>) {
  return applyDecorators(
    ApiGetResponse(type),
    ApiResourceErrors(),
  );
}

/**
 * Complete set of responses for a standard CREATE operation
 */
export function ApiCreateResponses(type: Type<any>) {
  return applyDecorators(
    ApiCreateResponse(type),
    ApiValidationErrors(),
    ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions' }),
  );
}

/**
 * Complete set of responses for a standard UPDATE operation
 */
export function ApiUpdateResponses(type: Type<any>) {
  return applyDecorators(
    ApiUpdateResponse(type),
    ApiValidationErrors(),
    ApiResourceErrors(),
  );
}
