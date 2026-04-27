# Nextbike Austria

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![HA min version](https://img.shields.io/badge/Home%20Assistant-%3E%3D2025.1-blue.svg)](https://www.home-assistant.io/)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/rolandzeiner/nextbike-austria/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![vibe-coded](https://img.shields.io/badge/vibe-coded-ff69b4?logo=musicbrainz&logoColor=white)](https://en.wikipedia.org/wiki/Vibe_coding)

Home Assistant integration for nextbike-operated bike-sharing stations across Austria. Uses the official [GBFS 2.3 feeds](https://github.com/MobilityData/gbfs) — no API key, no YAML editing, station-level tracking out of the box. Pick a city, type a station name, save. One device per station with three sensors: bikes available, docks available, e-bikes available.

## Supported Systems

Six Austrian nextbike systems are recognized in the config flow:

| System | Region | ~Stations |
|---|---|---:|
| `nextbike_wr` | Wien — **WienMobil Rad** | 259 |
| `nextbike_la` | **Niederösterreich** (St. Pölten, Wr. Neustadt, Tulln, Mödling, …) | 239 |
| `nextbike_si` | Innsbruck — **Stadtrad** | 55 |
| `nextbike_vt` | Tirol — **VVT REGIORAD** (Kufstein) | 21 |
| `nextbike_al` | Linz — **city bike Linz** | 50 |
| `nextbike_ka` | **Klagenfurt** | 48 |

If your city uses nextbike under a different `system_id`, open an issue — adding a system is a one-line change in `const.py` once the feed endpoint is verified.

## Supported Functions

- **Real-time station state** for any nextbike station in the six supported Austrian systems.
- **Three sensors per station**: `Bikes available`, `Docks available`, `E-bikes available`. Full attribute list in [Sensor Attributes](#sensor-attributes).
- **Multi-step config flow**: pick system → type station name → pick from dropdown. Live catalogue fetch during setup verifies the feed is reachable.
- **Reconfigure flow** to switch to a different station at the same system without losing the entry; **options flow** for polling interval and battery tracking — see [Configuration Parameters](#configuration-parameters).
- **Shared per-system polling**: if you track 10 Vienna stations, only one HTTP request per poll feeds them all — see [Data Updates](#data-updates).
- **Optional e-bike battery + reservation tracking**: per-station battery aggregates (avg / min / max %), sorted per-bike battery list, reserved-bike counts, and out-of-service (disabled) bike counts. Off by default — bandwidth profile in [Data Updates](#data-updates).
- **Direct rental link** via the `rental_uri` attribute (`https://nxtb.it/p/{id}` deep-links into the nextbike app).
- **Station-gone repair flow**: if the operator retires a station mid-operation, a Repairs notification surfaces and auto-clears when the station reappears or the entry is removed.
- **Diagnostics download** with redacted coordinates, full station snapshot, and coordinator state.

## Screenshots

<table>
  <tr>
    <td align="center"><img src="screenshots/card.webp" height="320" alt="Lovelace card" /></td>
    <td align="center"><img src="screenshots/card-config.webp" height="320" alt="Card editor" /></td>
    <td align="center"><img src="screenshots/config-flow.webp" height="320" alt="Config flow" /></td>
  </tr>
  <tr>
    <td align="center"><em>Lovelace card</em></td>
    <td align="center"><em>Card editor</em></td>
    <td align="center"><em>Config flow</em></td>
  </tr>
</table>

## Requirements

- Home Assistant **2025.1** or newer.
- **No API key** needed — all Austrian nextbike GBFS feeds are public.
- Outbound HTTPS access to `gbfs.nextbike.net`.

## Installation

### HACS (recommended)

1. HACS → **Integrations** → ⋯ → **Custom repositories**.
2. Add `https://github.com/rolandzeiner/nextbike-austria` as type **Integration**.
3. Search for "Nextbike Austria" and install.
4. Restart Home Assistant.

[![Add to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=rolandzeiner&repository=nextbike-austria&category=integration)

### Manual

1. Copy `custom_components/nextbike_austria/` into your HA `config/custom_components/`.
2. Restart Home Assistant.

## Setup

[![Open your Home Assistant instance and start setting up a new integration.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=nextbike_austria)

1. **Settings → Devices & Services → + Add Integration**.
2. Search for **Nextbike Austria**.
3. Pick the nextbike system (city / region) from the list.
4. Type part of a station name (minimum 2 characters) and submit. The integration probes the GBFS `station_information` feed to verify it's reachable and to fetch fresh matches.
5. Pick the station from the dropdown. Labels show capacity when published (e.g. `"Hoher Markt (capacity 25)"`).
6. Confirm the polling interval and save. Defaults are sensible — see [Configuration Parameters](#configuration-parameters) for the bounds and the per-entry options-flow fields.

Add more stations by running **Add Integration** again. Each station is its own config entry with its own Device in HA.

## Configuration Parameters

Setup and the per-entry options flow share the same field set. Reach the options flow via **Settings → Devices & Services → Nextbike Austria → Configure**. To change the system or station after setup, use **Reconfigure** on the entry instead.

| Field | Where | Default | Description |
|---|---|---|---|
| **System** | Setup | — | One of the six Austrian nextbike systems listed in [Supported Systems](#supported-systems). Cannot be changed via the options flow — use Reconfigure. |
| **Station name** | Setup | — | Free-text fragment, minimum 2 characters. Used to filter the dropdown of matching stations. |
| **Station** | Setup | — | Picked from the live catalogue. Cannot be changed via the options flow — use Reconfigure. |
| **Scan interval** | Setup + Options | `60 s` | Polling cadence in seconds. Floor `60` (matches the GBFS-advertised `ttl`), ceiling `900` (15 min). Polling faster than the floor is rejected because the upstream returns the same cached body. |
| **Track e-bike battery state** | Options | `off` | When enabled, the integration additionally fetches `free_bike_status.json` every 20 min and surfaces per-bike battery / reserved / disabled aggregates. See [Data Updates](#data-updates) for the bandwidth profile. |

## Sensor Attributes

Every `Bikes available` sensor carries:

| Attribute | Type | Example / notes |
|---|---|---|
| `state` (native value) | int | Count of bikes currently parked. |
| `attribution` | string | `"Data: nextbike GmbH, CC0-1.0"` — always present. |
| `station_id` | string | GBFS station identifier (stable across polls). |
| `system_id` | string | One of `nextbike_wr`, `nextbike_la`, `nextbike_si`, `nextbike_vt`, `nextbike_al`, `nextbike_ka`. |
| `capacity` | int \| null | Total docks. `null` for systems that don't publish capacity (most of NÖ). |
| `latitude` / `longitude` | float | Coordinates — redacted from diagnostics downloads. |
| `is_installed` / `is_renting` / `is_returning` | bool | Station online, can rent, can return. |
| `last_reported` | int | Unix epoch seconds of the station's last status update. |
| `vehicle_types_available` | list[dict] | Per-type count breakdown: `[{"vehicle_type_id": "183", "count": 17}, …]`. |
| `rental_uri` | string | Web deep-link (`https://nxtb.it/p/{id}`) that opens the nextbike app to this station. |

When **Track e-bike battery state** is enabled on an entry, the `Bikes available` sensor also carries (keys are omitted when the source is unavailable — templates can gate on `if 'x' in attrs`):

| Attribute | Type | Example / notes |
|---|---|---|
| `e_bike_avg_battery_pct`, `e_bike_min_battery_pct`, `e_bike_max_battery_pct` | float | Per-station battery % aggregated from e-bikes reporting `current_fuel_percent`. Upstream coverage is ~8.6% — stations with zero reporting bikes omit all three keys. |
| `e_bike_range_samples` | int | How many bikes at this station contributed a sample. |
| `e_bike_battery_list` | list[dict] | Sorted max→min: `[{"pct": 95.0, "type": "E-Bike"}, …]`. Drives per-slot battery fill in the bundled card. |
| `bikes_reserved` | int | Bikes physically at the station but held by another user. Only present when >0. |
| `bikes_reserved_types` | list[str] | Vehicle-type name per reserved bike (parallel to count). |
| `bikes_disabled` | int | Bikes physically at the station but out of service (flat tire, broken lock …). Only present when >0. |
| `bikes_disabled_types` | list[str] | Vehicle-type name per disabled bike. |
| `vehicle_type_names` | dict | `{vehicle_type_id: display_name}` — used by the card for slot tooltips. Always present when tracking is on. |

The `Docks available` sensor additionally exposes `is_virtual_station` and `capacity` so you can tell a geofence from a rack station when building dashboards.

## Data Updates

- **Poll interval** defaults to **60 s** (the GBFS-advertised `ttl`). Floor 60 s, ceiling 900 s — set per entry in the options flow.
- **Per-system shared fetch**: one HTTP request per system per poll, regardless of how many stations in that system are tracked. Each entry reads its station out of the shared snapshot.
- **Conditional GET**: the shared client remembers each feed's `Last-Modified` and sends `If-Modified-Since`. A `304 Not Modified` reuses the cached payload without re-downloading the body — particularly effective on quiet feeds like `vehicle_types.json`.
- **Battery / reservation tracking** (opt-in): with *Track e-bike battery state* enabled on at least one entry, the shared client additionally fetches `free_bike_status.json` every **20 min**, independent of the station poll interval. The feed is ~1.2 MB raw but only **~75 KB on the wire** for Wien thanks to `Accept-Encoding: gzip` (16.7× compression — measured April 2026) — approximately **5.3 MB/day / 160 MB/month** per opted-in Austrian system. The 20 min back-off is honoured even on failure, so a flaky upstream cannot trigger per-poll retries.
- **Partial-failure handling**: a missing or unreadable feed surfaces as `unavailable` on the affected entry; the shared client continues serving cached data to the others. Translated `UpdateFailed` messages explain the specific failure mode (timeout, HTTP status, invalid response).

## Use Cases

- **Commute helper** — "if the station next to my flat has zero bikes at 07:15, send me a push so I start walking to the S-Bahn instead."
- **Return-side automation** — "if my home station has fewer than 2 free docks when I'm about to arrive, alert me to divert to the next one." (Requires a system that publishes capacity — see Known Limitations.)
- **E-bike monitoring** — "notify me when an e-bike appears at Hauptbahnhof between 17:00–19:00". Use the `E-bikes available` sensor directly.
- **Rebalancing visibility** — dashboards showing which nearby stations are empty / full; the `rental_uri` attribute makes every station a one-click rental link.

## Automation Examples

```yaml
# Notify when an e-bike shows up at your home station during evening rush
automation:
  - alias: "E-bike back at Hoher Markt"
    trigger:
      - platform: numeric_state
        entity_id: sensor.hoher_markt_ebikes_available
        above: 0
    condition:
      - condition: time
        after: "17:00:00"
        before: "19:00:00"
    action:
      - service: notify.mobile_app_my_phone
        data:
          message: "E-bike available at Hoher Markt now."
```

```yaml
# Dashboard entity-filter card: only stations with bikes right now
# Entity IDs are auto-generated from the station name and your HA locale —
# pick the matching ones from Developer Tools → States.
type: entity-filter
entities:
  - sensor.hoher_markt_bikes_available
  - sensor.oper_karlsplatz_u_bikes_available
  - sensor.westbahnhof_s_u_bikes_available
state_filter:
  - operator: ">"
    value: 0
card:
  type: entities
  title: Bikes available near me
```

## Known Limitations

- **Niederösterreich dock data is incomplete.** The `nextbike_la` system publishes `capacity` for only 10 out of 239 stations, and permanently reports `num_docks_available: 0` for the rest — regardless of whether the station is empty or full. The integration detects this (missing `capacity` field) and reports the `Docks available` sensor as **`unknown`** rather than a misleading `0`. Wien, Innsbruck, Tirol, Linz, and Klagenfurt publish dock counts for nearly every station.
- **Station IDs are stable but `bike_id`s rotate** (privacy rotation by nextbike). Don't write automations keyed on individual bike identifiers — they won't persist across ticks.
- **Virtual stations** (`is_virtual_station: true`) are geofences without physical docks. The `Docks available` sensor reads 0 on these by design; use the `Bikes available` sensor instead.
- **`num_bikes_available` can exceed `capacity`** when bikes are crammed at full stations. Don't template on `capacity - bikes` as a synonym for "docks free".
- **Per-bike detail is opt-in.** `free_bike_status.json` (battery via `current_fuel_percent`, plus `is_reserved` / `is_disabled` flags) is skipped entirely unless *Track e-bike battery state* is enabled — bandwidth profile in [Data Updates](#data-updates).
- **Battery coverage is sparse upstream.** Only ~8.6% of e-bikes report a `current_fuel_percent` sample — a station may opt in and still see no battery data until at least one of its bikes reports.

## Troubleshooting

- **"Cannot connect" during setup.** The `station_information` probe failed. Usually transient; retry. Verify connectivity to `https://gbfs.nextbike.net/maps/gbfs/v2/`.
- **Sensor state stuck at `unavailable`.** The station may have been retired upstream. Check for a Repairs notification (`station_gone`) — if present, remove the entry and add a different station.
- **All three sensors read 0 for a Wien or Innsbruck station.** The station is real, it just happens to be empty (or full). Watch for a couple of minutes; city-center stations turn over constantly.
- **Collecting diagnostics for a bug report.** Settings → Devices & Services → Nextbike Austria → ⋯ → Download diagnostics. Coordinates are redacted automatically.
- **Debug logs:**
  ```yaml
  # configuration.yaml
  logger:
    default: info
    logs:
      custom_components.nextbike_austria: debug
  ```

## Attribution

All data flows through the [nextbike GBFS 2.3 feeds](https://github.com/MobilityData/gbfs) and is published under the **Creative Commons Zero 1.0 Public Domain Dedication** (CC0-1.0), as declared in each system's `system_information.license_id`. No legal attribution is required — crediting nextbike is good practice but not obligatory. The integration surfaces the attribution string on every sensor regardless:

> Data: nextbike GmbH, CC0-1.0

## Removal

1. **Settings → Devices & Services** → find the Nextbike Austria entry → ⋯ → **Delete**.
2. Repeat for each tracked station (one entry per station).
3. Remove `custom_components/nextbike_austria/` from the HA config (manual installs only; HACS removes it automatically).

## License

MIT — see [LICENSE](LICENSE). The integration code is MIT; nextbike data flowing through it is CC0-1.0 (public domain).

## Disclaimer

This integration is not affiliated with or endorsed by nextbike GmbH. All station and bike-availability data is provided through public [GBFS 2.3 feeds](https://github.com/MobilityData/gbfs) operated by nextbike and its Austrian partners, and is published under the Creative Commons Zero 1.0 Public Domain Dedication (CC0-1.0). The developer assumes no liability for the accuracy, completeness, or timeliness of the displayed data — including but not limited to bike availability, dock availability, station operational status, or estimated e-bike range. Use at your own risk.

---

Diese Integration steht in keiner Verbindung zur nextbike GmbH und wird von dieser nicht unterstützt. Alle Stations- und Verfügbarkeitsdaten stammen aus öffentlichen [GBFS-2.3-Feeds](https://github.com/MobilityData/gbfs), die von nextbike und ihren österreichischen Partnern betrieben und unter der Creative-Commons-Lizenz „Public Domain Dedication" (CC0-1.0) veröffentlicht werden. Für die Richtigkeit, Vollständigkeit und Aktualität der angezeigten Daten — einschließlich Rad- und Platzverfügbarkeit, Stationsstatus oder geschätzter E-Bike-Reichweite — wird keine Haftung übernommen. Nutzung auf eigene Verantwortung.
