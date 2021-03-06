export default {
  settings: {
    set: function (payload) {
      return {
        type: 'SET_SETTING',
        payload,
      };
    },
  },
  notifications: {
    push: function (payload) {
      return {
        type: 'PUSH_NOTIFICATION',
        payload,
      };
    },
  },
  tooltips: {
    rebind: function () {
      return {
        type: 'REBIND_TOOLTIPS',
      };
    },
  },
};
