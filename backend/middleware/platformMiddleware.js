const platformMiddleware = (req, res, next) => {
  req.platform = req.headers['x-platform'] || 'web';

  next();
};

export default platformMiddleware;
