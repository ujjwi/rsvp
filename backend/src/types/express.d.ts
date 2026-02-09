declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: import('mongoose').Types.ObjectId;
      };
    }
  }
}

export {};
