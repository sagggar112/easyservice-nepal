const TRANSITIONS = {
  Pending: ["Accepted", "Cancelled"],
  Accepted: ["In Progress", "Cancelled"],
  "In Progress": ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

const canTransition = (from, to) => TRANSITIONS[from]?.includes(to) || false;

module.exports = { TRANSITIONS, canTransition };
