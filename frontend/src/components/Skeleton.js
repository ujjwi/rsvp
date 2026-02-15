import React from 'react';

function Skeleton({ className = '', style = {}, ...props }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <div className="event-container event-card-skeleton">
      <div className="skeleton-event-header">
        <Skeleton className="skeleton-avatar" />
        <Skeleton className="skeleton-text skeleton-name" />
      </div>
      <div className="skeleton-event-body">
        <Skeleton className="skeleton-text skeleton-title" />
        <Skeleton className="skeleton-text skeleton-date" />
        <Skeleton className="skeleton-text skeleton-desc" />
        <Skeleton className="skeleton-text skeleton-desc-short" />
      </div>
      <div className="skeleton-event-footer">
        <Skeleton className="skeleton-btn" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="profile-skeleton skeleton-events-grid">
      <EventCardSkeleton />
      <EventCardSkeleton />
      <EventCardSkeleton />
    </div>
  );
}

export function EventDetailSkeleton() {
  return (
    <div className="page-wrapper">
      <div className="container">
        <Skeleton className="skeleton-back-btn" />
        <div className="skeleton-event-detail">
          <EventCardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function EventsGridSkeleton({ count = 6 }) {
  return (
    <div className="row events-row">
      {Array.from({ length: count }, (_, i) => (
        <div className="col-md-4 col-lg-4 mb-4" key={i}>
          <EventCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
