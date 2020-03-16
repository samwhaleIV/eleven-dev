import Runtime from "./src/runtime.js";
import Debug from "./src/debug.js";
import Constants from "./src/constants.js";

const autoSingleton = module => {
    return Singleton({
        module: module,
        autoInstantiation: true,
        deferInstantiation: false
    });
};

const SVCC = Namespace.create({
    name: Constants.Namespace,
    modules: [autoSingleton(Runtime),autoSingleton(Debug)]
});

Namespace.makeGlobal(SVCC);
SVCC.Runtime.Start();
