// jest용 @sentry/react-native 목. 테스트가 queryClient를 통해 Sentry를 transitively
// 로드해도 네이티브 모듈 없이 no-op으로 동작하게 한다. (moduleNameMapper로 연결)
module.exports = {
  init: () => {},
  wrap: (component) => component,
  captureException: () => {},
  captureMessage: () => {},
  setTag: () => {},
  setContext: () => {},
  setUser: () => {},
  addBreadcrumb: () => {},
};
