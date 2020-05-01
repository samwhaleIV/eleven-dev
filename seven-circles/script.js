import Runtime from "./src/runtime.js";
import Debug from "./src/debug.js";
import Constants from "./src/constants.js";

const AutoSingleton = module => {
    return Singleton({
        module: module,
        autoInstantiation: true,
        deferInstantiation: false
    });
};

const SVCC = Namespace.create({
    name: Constants.Namespace,
    modules: [AutoSingleton(Runtime),AutoSingleton(Debug)]
});

Namespace.makeGlobal(SVCC);

DEV ? SVCC.Runtime.DevStart() : SVCC.Runtime.Start();
