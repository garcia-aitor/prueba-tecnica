// Webpack inyecta process.env.NODE_ENV al empaquetar; esto solo tipa el acceso en el cliente.
declare const process: {
  env: {
    NODE_ENV?: string;
  };
};
