# Kadence Core Components

Components may rely on Kadence Specific variables or environment settings that could prevent them from working in an external project. These are not intended for external use, although the goal is to eventually make them available for use in other projects.

## Text Domain Placeholder

Strings inside this package now use the placeholder `__KADENCE__TEXT__DOMAIN__` instead of a concrete text domain. Consumers are expected to swap this placeholder with their plugin or project text domain during their build process (for example by using Webpack's `DefinePlugin`, a Babel transform, or a simple search-and-replace step). This keeps the compiled assets ready for translation while allowing each project to control the final domain.
