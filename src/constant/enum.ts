export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export enum ReactionType {
  Like = 'like',
  Dislike = 'dislike',
}

export const enum UserStatus {
  ACTIVED = 'actived',
  LOCKED = 'locked',
  DELETED = 'deleted',
}

export const enum PostStatus {
  POSTED = 'posted',
  SCHEDULED = 'scheduled',
  HIDDEN = 'hidden',
}

export const enum ReportStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export const enum AppealStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export const enum AppealTypes {
  POST = 'post',
  USER = 'user',
}
