exports.getRequestId = (req) => {
  return req.query.friendId || req.userData.userId
}