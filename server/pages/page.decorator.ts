import { applyDecorators, Controller } from "@nestjs/common";
import "reflect-metadata";

/**
 * sets the target page
 * 
 * @param page 
 */
const PageDecorator = (page: string): MethodDecorator => {
  return (target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    Reflect.defineMetadata("next/page", page.startsWith('/') ? page : `/${page}`, descriptor.value);
    return descriptor;
  }
}

/**
 * sets a controller to a next.js controller
 * 
 * @param page 
 */
const NextControllerDecorator = (): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata("next/controller", true, target);
  }
}

/**
 * next.js page decorator
 * 
 * @param path
 * @param page 
 */
export const Page = (path: MethodDecorator, page: string) => {
  return applyDecorators(path, PageDecorator(page));
}

/**
 * next.js controller
 */
export const NextController = (prefix?: string) => {
  return applyDecorators(prefix ? Controller(prefix) : Controller(), NextControllerDecorator())
}