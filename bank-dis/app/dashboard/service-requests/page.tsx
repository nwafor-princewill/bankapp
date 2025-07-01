'use client';
import ServiceRequestForm from './ServiceRequestForm';
// import RequestHistory from './RequestHistory';

export default function ServiceRequestsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Service Requests</h1>
      <ServiceRequestForm />
    </div>
  );
}