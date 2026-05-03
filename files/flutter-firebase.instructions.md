# Stack: Flutter + Firebase + Riverpod

Generic conventions for any project using Flutter, Dart, Firebase, and Riverpod with code generation. Project-specific rules (Firestore schema, feature architecture, screen structure) live in each repo's `.github/instructions/` or `copilot-instructions.md`.

---

## State management: Riverpod + code generation

- Use `@riverpod` annotations with `riverpod_annotation` for all state management.
- Package: `hooks_riverpod` (includes `flutter_riverpod`).
- **Widget choice**: `ConsumerWidget` by default. Use `HookConsumerWidget` only when hooks are needed (`useState`, `useEffect`, `useAnimationController`).
- All providers have `.g.dart` counterparts — always include `part 'filename.g.dart';` directive.
- **Build command**: `flutter pub run build_runner build --delete-conflicting-outputs`
- **Riverpod 3.x breaking change**: `.asData?.value` is removed — use `.value` instead (returns `null` when loading or in error state). `.valueOrNull` is also removed.

### Provider pattern template

```dart
part 'my_provider.g.dart';

@riverpod
class MyNotifier extends _$MyNotifier {
  static final _log = Logger('MyNotifier');

  Timer? _timer;
  StreamSubscription? _subscription;

  @override
  MyState build() {
    ref.onDispose(() {
      _log.fine('Disposing MyNotifier resources');
      _timer?.cancel();
      _subscription?.cancel();
      _timer = null;
      _subscription = null;
    });
    return MyState();
  }
}
```

Always register disposal hooks in `build()` for timers, streams, and resources.

---

## Logging convention

- Use `package:logging` throughout.
- Class-level logger: `static final _log = Logger('ClassName');`
- Top-level logger (provider files with `@riverpod` functions): `final _log = Logger('...');`
- Log levels:
  - `_log.severe()` — errors (production-visible)
  - `_log.warning()` — warnings
  - `_log.fine()` — general flow (development)
  - `_log.finest()` — detailed traces (development)
- Replace `print()` with `_log.fine()` — never leave `print()` in committed code.

---

## Async & error handling

**Fire-and-forget async calls** (void return sites, e.g. `onPressed`):

```dart
unawaited(() async {
  try {
    await someAsyncOperation();
  } catch (e, st) {
    _log.severe('Describe what failed', e, st);
  }
}());
```

Do NOT discard a Future silently or use `.catchError()` (type-unsafe in Dart 3.x).

**Service methods (`Future<T>`)** — catch specific exception types, log with stack trace, rethrow:

```dart
try {
  final snapshot = await _db.collection('...').get();
  return snapshot.docs.map(...).toList();
} on FirebaseException catch (e, st) {
  _log.severe('Failed to fetch ...', e, st);
  rethrow;
}
```

**`@riverpod Future<T>` providers** — same pattern so Riverpod surfaces the error state:

```dart
@riverpod
Future<List<String>> myList(Ref ref) async {
  try {
    return await ref.watch(myServiceProvider).getItems();
  } catch (e, st) {
    _log.severe('Failed to load items', e, st);
    rethrow;
  }
}
```

**Stream error handling** — add `.handleError` before returning to Riverpod:

```dart
return _db.collection('...').snapshots()
    .map((snap) => ...)
    .handleError((Object e, StackTrace st) {
      _log.severe('Stream error', e, st);
      Error.throwWithStackTrace(e, st);
    });
```

**`context.mounted` after `await`** — always check before using `context`, `ScaffoldMessenger`, or `Navigator`:

```dart
await someOperation();
if (!context.mounted) return;
ScaffoldMessenger.of(context).showSnackBar(...);
```

---

## Image error handling

- `Image` / `Image.network` / `Image.asset` → use `errorBuilder:` returning a placeholder widget.
- `DecorationImage` → use `onError: (e, st) => _log.warning(...)` (no `errorBuilder` on `DecorationImage`).
- Any artwork/thumbnail URL field → always route through a helper that returns `NetworkImage` for http/https URLs and `AssetImage` for local paths.

---

## Immutable state classes

All state classes use:
- `@immutable` annotation
- `copyWith()` method for updates
- `const` constructors where possible

---

## Dumb Widget Pattern

When asked to refactor a widget, rename a widget, or extract hardcoded strings, follow this exact process in order:

1. **Create `assets/mock_data/<feature>.json`** — JSON array with all hardcoded string values as fields
2. **Create `lib/models/<feature>_item.dart`** — `@immutable` model with `const` constructor, `fromJson`, `toJson`, `copyWith`
3. **Create `lib/services/api/<feature>_service.dart`** — three things in order: abstract interface, `MockXService` (active, reads JSON via `rootBundle.loadString`), `RealXService` stub fully commented out
4. **Create `lib/providers/settingsProviders/<feature>_provider.dart`** — two `@riverpod` providers: one for the service, one `Future<List<Model>>` that calls it
5. **Rename and update the widget file** — accept `Model?` param; render disabled state when `null`; delete the old widget file
6. **Update all import sites** — grep for old file name and class name; update every import and usage
7. **Update the parent screen** — watch the provider using `.when(data:, loading:, error:)`, pass resolved `items.firstOrNull` down
8. **Register asset** in `pubspec.yaml` under `flutter.assets` if the folder is new
9. **Run `flutter pub run build_runner build --delete-conflicting-outputs`** to generate `.g.dart`

Do NOT create a separate `mock_<feature>_service.dart` file — the mock lives inside `<feature>_service.dart`.

---

## Performance best practices

- **Avoid polling timers** — use stream listeners instead of `Timer.periodic` for position or state tracking.
- Use `player.positionStream.listen()` instead of 1ms timers.
- Always dispose: track all `Timer` and `StreamSubscription` instances; cancel in `ref.onDispose()`.

---

## API & constant usage

- Use explicitly recommended APIs — when Flutter/Dart docs recommend one API over another, always use the recommended one.
- Do not use constants, methods, or classes the SDK explicitly warns against.
- Use `kDebugMode` (not `kReleaseMode`) to gate verbose logging.

---

## Dependency management

- Use caret (`^`) version ranges in `pubspec.yaml`; only pin exact versions if a specific version fix is required.
- Run `flutter pub get` after modifying dependencies.
- Check for platform-specific setup after adding plugins (Android `build.gradle`, iOS `Podfile`).
