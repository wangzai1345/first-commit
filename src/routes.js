import {routes,route} from "react-router-dom";//路由
import React from 'react';

export default routes([
    route("/",() => import("./App")),
    route("counter",() => import("./counter"))
/*     route("/test",() => import("./test")) */
]);