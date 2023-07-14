mobiletto-orm-typedef
=====================
This library provides mobiletto-independent code for mobiletto-orm, like
`MobilettoOrmTypeDef` and various error types.

Front-end code need not depend on the underlying mobiletto and mobiletto-orm libraries, but
can still make use of the type definitions that its server is using to validate and persist objects.

For example, to ensure that frontend form validation is synchronized with backend storage validation.

### Source
* [mobiletto-orm-typedef on GitHub](https://github.com/cobbzilla/mobiletto-orm-typedef)
* [mobiletto-orm-typedef on npm](https://www.npmjs.com/package/mobiletto-orm-typedef)

## Support and Funding
I would be sincerely grateful for any [contribution via Patreon](https://www.patreon.com/cobbzilla)

## Installation and usage
You can install `mobiletto-orm-typedef` via npm or yarn or pnpm

### npm package

    # install with npm
    npm i mobiletto-orm-typedef

    # install with yarn
    yarn add mobiletto-orm-typedef

    # install with pnpm
    pnpm add mobiletto-orm-typedef

### From source
To access the mobiletto-orm-typedef source:

    # Clone source and install dependencies
    git clone https://github.com/cobbzilla/mobiletto-orm-typedef.git
    cd mobiletto-orm-typedef
    pnpm install

### Using Mobiletto ORM Type Definitions
See the mobiletto-orm documentation on [Type Definitions](https://github.com/cobbzilla/mobiletto-orm#Type-Definitions)

You can also check out the [test suite](./test) for examples.
