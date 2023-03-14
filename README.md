# Create a Namespace Cloud cluster

This repository hosts a GitHub action that creates a [Namespace Cloud](https://cloud.namespace.so)
cluster and exposes a preconfigured `kubectl` to access it.

## Example

```yaml
jobs:
  deploy:
    name: Ephemeral cluster
    runs-on: ubuntu-latest
    # These permissions are needed to interact with GitHub's OIDC Token endpoint.
    permissions:
      id-token: write
      contents: read
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Install and configure Namespace Cloud CLI
        uses: namespacelabs/nscloud-setup@v0.0.1
      - name: Create a Namespace Cloud cluster
        uses: namespacelabs/nscloud-action@v0.0.5
      - name: Apply configurations
        run: |
          kubectl apply -f foo/bar.yaml
```

## Requirements

This action uses `nsc`, the Namespace Cloud CLI.
You can add it to your workflow using [namespacelabs/nscloud-setup](https://github.com/namespacelabs/nscloud-setup)
(see [example](#example)).
