> [!NOTE]  
> [zed released it’s own git panel](https://zed.dev/blog/git), so this project won’t have that much use for me anymore.
> 
> it still works, but since i really enjoyed the native one this won’t receive further updates.

# zit

> a fan-made [zed](https://zed.dev/)-inspired feature-light git companion

![zit screenshot](/doc/screenshot.png)

### v1 roadmap

> not in any specific order

- [ ] open recent
- [ ] open through cli args
- [ ] hotkeys (using electron menubar)
- [ ] command palette
- [ ] progress indicator + disabled state (for pull/push etc)
- [ ] branding
- [ ] release pipeline (using github actions)
- [ ] show remote branches
- [ ] checkout remote branches locally
- [ ] settings page
- [ ] reopen open projects on app shutdown setting
- [ ] persist windows locations on shutdown
- [ ] rename branch
- [ ] welcome screen
- [ ] list git stashes
- [ ] handling when git is not available
- [ ] popup window to view diffs
- [ ] finally migrate to [`gpui`](https://gpui.rs/) (?)

### non-goals for v1

1. be feature-rich — like [git-up](https://gitup.co/)
2. have github or any other host-specific logic

### acknowledgements

huge props for the zed folks to come up with a brilliant piece of technology,
and also [atom](https://atom-editor.cc/) for guiding a lot of the initial ux sketches.

this project heavily relies on [`electron`](https://www.electronjs.org/), [`react`](https://react.dev), [`ariakit`](https://ariakit.org/) and [`tailwindcss`](https://tailwindcss.com/).
and acts as a playground for some personal libraries like [`zedwind`](https://github.com/vitordino/zedwind) and [`reduxtron`](https://github.com/vitordino/reduxtron).
