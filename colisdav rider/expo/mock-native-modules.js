// Mock native modules for web platform to prevent TurboModule errors
module.exports = {
  // Mock PlatformConstants (the main export that TurboModuleRegistry looks for)
  getConstants: () => ({
    forceTouchAvailable: false,
    interfaceIdiom: "phone",
    osVersion: "web",
    systemName: "Web",
    isTesting: false,
    reactNativeVersion: {
      major: 0,
      minor: 76,
      patch: 9,
    },
  }),

  // Mock PlatformConstants
  PlatformConstants: {
    getConstants: () => ({
      forceTouchAvailable: false,
      interfaceIdiom: "phone",
      osVersion: "web",
      systemName: "Web",
      isTesting: false,
      reactNativeVersion: {
        major: 0,
        minor: 76,
        patch: 9,
      },
    }),
  },

  // Mock other common native modules
  NativeModules: {
    PlatformConstants: {
      getConstants: () => ({
        forceTouchAvailable: false,
        interfaceIdiom: "phone",
        osVersion: "web",
        systemName: "Web",
        isTesting: false,
        reactNativeVersion: {
          major: 0,
          minor: 76,
          patch: 9,
        },
      }),
    },

    // Add other native modules that might cause issues
    StatusBarManager: {
      HEIGHT: 0,
    },

    UIManager: {
      getConstants: () => ({}),
    },

    DeviceInfo: {
      getConstants: () => ({
        Dimensions: {
          window: {
            width: 375,
            height: 667,
            scale: 2,
            fontScale: 1,
          },
          screen: {
            width: 375,
            height: 667,
            scale: 2,
            fontScale: 1,
          },
        },
      }),
    },
  },

  // Mock Platform module
  Platform: {
    OS: "web",
    Version: "web",
    isPad: false,
    isTV: false,
    isTVOS: false,
    select: (obj) => obj.web || obj.default,
  },

  // Export the main react-native module structure
  __esModule: true,
  default: {
    Platform: {
      OS: "web",
      Version: "web",
      isPad: false,
      isTV: false,
      isTVOS: false,
      select: (obj) => obj.web || obj.default,
    },
    NativeModules: {
      PlatformConstants: {
        getConstants: () => ({
          forceTouchAvailable: false,
          interfaceIdiom: "phone",
          osVersion: "web",
          systemName: "Web",
          isTesting: false,
          reactNativeVersion: {
            major: 0,
            minor: 76,
            patch: 9,
          },
        }),
      },
      // Add Platform Constants with space (what TurboModuleRegistry looks for)
      "Platform Constants": {
        getConstants: () => ({
          forceTouchAvailable: false,
          interfaceIdiom: "phone",
          osVersion: "web",
          systemName: "Web",
          isTesting: false,
          reactNativeVersion: {
            major: 0,
            minor: 76,
            patch: 9,
          },
        }),
      },
    },
  },
};
