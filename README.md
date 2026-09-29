# Nextbike Austria

[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)
[![HA min version](https://img.shields.io/badge/Home%20Assistant-%3E%3D2025.1-blue.svg)](https://www.home-assistant.io/)
[![Version](https://img.shields.io/github/v/release/rolandzeiner/nextbike-austria?label=version&color=blue)](https://github.com/rolandzeiner/nextbike-austria/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![vibe-coded](https://img.shields.io/badge/vibe-coded-ff69b4?logo=musicbrainz&logoColor=white)](https://en.wikipedia.org/wiki/Vibe_coding)
[![Live demo](https://img.shields.io/badge/live-demo-2196F3.svg)](https://demo.rolandzeiner.at/#nextbike)

Home Assistant integration for nextbike-operated bike-sharing stations across Austria. Uses the official [GBFS 2.3 feeds](https://github.com/MobilityData/gbfs) — no API key, no YAML editing, station-level tracking out of the box. Pick a city, type a station name, save. One device per station with three sensors: bikes available, docks available, e-bikes available. A bundled Lovelace card draws the station's rack slot by slot.

## Supported Systems

Six Austrian nextbike systems are recognized in the config flow. Station counts are from the live feeds, September 2026:

| System | Region | ~Stations |
|---|---|---:|
| `nextbike_wr` | Wien — **WienMobil Rad** | 260 |
| `nextbike_la` | **Niederösterreich** (St. Pölten, Wr. Neustadt, Tulln, Mödling, …) | 252 |
| `nextbike_si` | Innsbruck — **Stadtrad** | 55 |
| `nextbike_vt` | Tirol — **VVT REGIORAD** (Kufstein) | 23 |
| `nextbike_al` | Linz — **city bike Linz** | 54 |
| `nextbike_ka` | **Klagenfurt** | 51 |

If your city uses nextbike under a different `system_id`, open an issue — adding a system is a small change once the feed endpoint is verified.

## Supported Functions

- **Real-time station state** for any nextbike station in the six supported Austrian systems.
- **Three sensors per station**: `Bikes available`, `Docks available`, `E-bikes available`. Full attribute list in [Sensor Attributes](#sensor-attributes).
- **Multi-step config flow**: pick system → type station name → pick from dropdown. Live catalogue fetch during setup verifies the feed is reachable.
- **Options flow** for the update interval and battery tracking — see [Configuration Parameters](#configuration-parameters).
- **Shared per-system polling**: if you track 10 Vienna stations, one HTTP request per poll feeds them all — and all 10 refresh together, off the same snapshot — see [Data Updates](#data-updates).
- **Optional e-bike battery + reservation tracking**: per-station battery aggregates (avg / min / max %), sorted per-bike battery list, reserved-bike counts, and out-of-service (disabled) bike counts. Off by default — bandwidth profile in [Data Updates](#data-updates).
- **Bundled Lovelace card**: a slot-by-slot bike rack with e-bike charge, status flags and a rent link. It registers itself, so there's no dashboard resource to add — see [Lovelace Card](#lovelace-card).
- **Direct rental link** via the `rental_uri` attribute (`https://nxtb.it/p/{id}` deep-links into the nextbike app).
- **Station-gone repair flow**: if the operator retires a station mid-operation, a Repairs notification surfaces and clears itself when the station reappears.
- **Diagnostics download** with redacted coordinates, station / coordinator state summary, and counts derived from the live snapshot. The snapshot body itself stays out, so an issue doesn't reveal the station's current state.
- **English and German** for the config flow, options, entity names and the card.
- **Entity-first card picker**: picking one of the integration's sensors when adding a dashboard card suggests the bundled card, already configured. Needs Home Assistant 2026.6; older versions are unaffected. *(1.3.0)*

## Screenshots

<table>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/rolandzeiner/nextbike-austria/main/screenshots/card.webp" height="320" alt="Lovelace card" /></td>
    <td align="center"><img src="https://raw.githubusercontent.com/rolandzeiner/nextbike-austria/main/screenshots/card-config.webp" height="320" alt="Card editor" /></td>
    <td align="center"><img src="https://raw.githubusercontent.com/rolandzeiner/nextbike-austria/main/screenshots/config-flow.webp" height="320" alt="Config flow" /></td>
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

1. Open HACS and search for **Nextbike Austria**.
2. Select it and choose **Download**.
3. Restart Home Assistant.

[![Add to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=rolandzeiner&repository=nextbike-austria&category=integration)

### Manual

1. Download `nextbike_austria.zip` from the [latest release](https://github.com/rolandzeiner/nextbike-austria/releases/latest).
2. Extract it into `config/custom_components/nextbike_austria/`.
3. Restart Home Assistant.

## Setup

[![Open your Home Assistant instance and start setting up a new integration.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=nextbike_austria)

1. **Settings → Devices & Services → + Add Integration**.
2. Search for **Nextbike Austria**.
3. Pick the nextbike system (city / region) from the list.
4. Type part of a station name (minimum 2 characters) and submit. The integration probes the GBFS `station_information` feed to verify it's reachable and to fetch fresh matches.
5. Pick the station from the list. Labels show capacity when published (e.g. `"Hoher Markt (capacity 25)"`). If the station isn't there, choose **↩ Search again**.
6. Set the update interval on the same step (the default of 60 s is the fastest the feed allows) and submit.

Add more stations by running **Add Integration** again. Each station is its own config entry with its own Device in HA.

## Lovelace Card

The card ships with the integration and registers itself — there's no dashboard resource to add. Pick **Nextbike Austria Card** in the card picker, or add it in YAML:

```yaml
type: custom:nextbike-austria-card
entities:
  - entity: sensor.hoher_markt_bikes_available
  - entity: sensor.oper_karlsplatz_u_bikes_available
layout: tabs
```

Point `entities` at `Bikes available` sensors: that's the sensor carrying the station details the card draws. The visual editor offers every option below.

| Option | Type | Default | Description |
|---|---|---|---|
| `entities` | list | first station found | The stations to show. A station whose sensor is gone falls back to the first one found. |
| `layout` | `stacked` \| `tabs` | `stacked` | `stacked` shows every station in one column; `tabs` adds a tab strip once two or more stations are picked. |
| `show_rack` | boolean | `true` | The bike rack, one slot per dock. Only for stations that publish a capacity. |
| `show_legend` | boolean | `true` | The key under the rack. |
| `show_ebikes` | boolean | `true` | The e-bike count chip. |
| `show_battery` | boolean | `true` | Fills each e-bike slot to its charge and shows the station's average charge beside the e-bike count. Needs **Track e-bike battery state** on the station's entry. |
| `show_docks` | boolean | `true` | The free-docks chip. Stays hidden for stations without a published capacity. |
| `show_flags` | boolean | `true` | Warnings when the station is offline, not renting or not taking returns, and a note on virtual stations. |
| `show_timestamp` | boolean | `true` | How long ago the station last reported. |
| `show_rent_button` | boolean | `true` | A link that opens the station in the nextbike app. |
| `hide_header` | boolean | `false` | Hides the station name, region and map link. |
| `hide_attribution` | boolean | `false` | Hides the data-source line. |

Reserved and out-of-service bikes show up as lock and wrench slots in the rack, also only with **Track e-bike battery state** on. Older cards configured with a single `entity:` keep working.

## Configuration Parameters

Setup and the per-entry options flow share the update interval. Reach the options flow via **Settings → Devices & Services → Nextbike Austria → Configure**. An entry stays tied to its station: to track a different station or system, add a new entry and delete the old one.

| Field | Where | Default | Description |
|---|---|---|---|
| **System** | Setup | — | One of the six Austrian nextbike systems listed in [Supported Systems](#supported-systems). Fixed once the entry exists. |
| **Station name** | Setup | — | Free-text fragment, minimum 2 characters. Used to filter the dropdown of matching stations. |
| **Station** | Setup | — | Picked from the live catalogue. Fixed once the entry exists. |
| **Update interval (seconds)** | Setup + Options | `60` | Polling cadence in seconds. Floor `60` (matches the GBFS-advertised `ttl`), ceiling `900` (15 min). Polling faster than the floor is rejected because the upstream returns the same cached body. |
| **Track e-bike battery state** | Options | `off` | When enabled, the integration additionally fetches `free_bike_status.json` every 20 min and surfaces per-bike battery / reserved / disabled aggregates. See [Data Updates](#data-updates) for the bandwidth profile. |

## Sensor Attributes

Every `Bikes available` sensor carries:

| Attribute | Type | Example / notes |
|---|---|---|
| `state` (native value) | int | Bikes available to rent. Reserved and out-of-service bikes don't count. |
| `attribution` | string | `"Data: nextbike GmbH, CC0-1.0"` — always present. |
| `station_id` | string | GBFS station identifier (stable across polls). |
| `system_id` | string | One of `nextbike_wr`, `nextbike_la`, `nextbike_si`, `nextbike_vt`, `nextbike_al`, `nextbike_ka`. |
| `system_label` | string | Region name, e.g. `"Wien"`. |
| `station_display_name` | string | The station name from setup, without the sensor's name suffix. |
| `capacity` | int \| null | Total docks. `null` for systems that don't publish capacity (most of NÖ). |
| `num_docks_available` | int | Free docks as upstream reports them. The `Docks available` sensor reads `unknown` where this value can't be trusted. |
| `is_virtual_station` | bool | `true` for a geofenced zone without physical docks. |
| `latitude` / `longitude` | float | Coordinates — redacted from diagnostics downloads. |
| `is_installed` / `is_renting` / `is_returning` | bool | Station online, can rent, can return. |
| `last_reported` | string | ISO 8601 UTC timestamp of the station's last status update, e.g. `"2026-09-29T12:00:00+00:00"`. |
| `vehicle_types_available` | list[dict] | Per-type count breakdown: `[{"vehicle_type_id": "183", "count": 17}, …]`. |
| `rental_uri` | string | Web deep-link (`https://nxtb.it/p/{id}`) that opens the nextbike app to this station. |
| `e_bike_vehicle_type_ids` | list[str] | The system's e-bike vehicle-type ids. Present when the system lists e-bike types. |

`last_reported`, `vehicle_types_available` and `e_bike_battery_list` change on nearly every poll, so they are kept out of the recorder's history.

When **Track e-bike battery state** is enabled on an entry, the `Bikes available` sensor also carries (keys are omitted when the source is unavailable — templates can gate on `if 'x' in attrs`):

| Attribute | Type | Example / notes |
|---|---|---|
| `e_bike_avg_battery_pct`, `e_bike_min_battery_pct`, `e_bike_max_battery_pct` | float | Per-station battery % aggregated from e-bikes reporting `current_fuel_percent`. Stations where no e-bike reports a charge omit all three keys. |
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
- **Per-system shared fetch**: one HTTP request per system per poll, regardless of how many stations in that system are tracked. Every entry for that system updates from the same snapshot at the same moment, so two stations never disagree about how fresh their data is.
- **Static data on a slower clock**: station names, coordinates and capacity live in `station_information.json`, which only changes when an operator installs or renames a rack. It refreshes every **6 hours** instead of every poll, halving the steady-state request count. A station the live feed reports but the cached list doesn't know triggers an immediate refresh, so a new rack appears on the next poll rather than hours later. The vehicle-type list (`vehicle_types.json`) follows the same 6-hour clock, so a new e-bike type is counted without a restart.
- **Compressed transfers**: every feed arrives gzip-compressed, 21× smaller for Wien's live station feed. There's no `If-Modified-Since` revalidation: nextbike regenerates each feed's `Last-Modified` every minute, so a `304 Not Modified` never happens at these intervals (measured September 2026).
- **Battery / reservation tracking** (opt-in): with *Track e-bike battery state* enabled on at least one entry, the shared client additionally fetches `free_bike_status.json` every **20 min**, independent of the station poll interval. For Wien, the largest system, the feed is ~1.35 MB raw but only **~80 KB on the wire** thanks to gzip (16.5× compression — measured September 2026): about **6 MB/day / 180 MB/month**. The other systems' feeds are a fraction of that. The 20 min back-off is honoured even on failure, so a flaky upstream cannot trigger per-poll retries.
- **Back-off on errors**: from the second failed poll in a row, the interval doubles with each further failure, up to **1 hour**. The first successful poll restores the configured interval. A failed request also pauses the whole system for a minute: the other stations in it report the same error instead of asking again. If nextbike answers `429` or `503` with a `Retry-After` header, the integration waits that long (up to a day).
- **Partial-failure handling**: a missing or unreadable feed surfaces as `unavailable` on the affected entry; the shared client continues serving cached data to the others. Translated `UpdateFailed` messages explain the specific failure mode (timeout, HTTP status, invalid response).

## Use Cases

- **Commute helper** — "if the station next to my flat has zero bikes at 07:15, send me a push so I start walking to the S-Bahn instead."
- **Return-side automation** — "if my home station has fewer than 2 free docks when I'm about to arrive, alert me to divert to the next one." (Requires a system that publishes capacity — see Known Limitations.)
- **E-bike monitoring** — "notify me when an e-bike appears at Hauptbahnhof between 17:00–19:00". Use the `E-bikes available` sensor directly.
- **Rebalancing visibility** — dashboards showing which nearby stations are empty / full; the `rental_uri` attribute makes every station a one-click rental link.

## Automation Examples

```yaml
# Notify when an e-bike shows up at your home station during evening rush.
# Paste into a new automation: Settings → Automations & scenes →
# Create automation → ⋮ → Edit in YAML.
alias: "E-bike back at Hoher Markt"
triggers:
  - trigger: numeric_state
    entity_id: sensor.hoher_markt_e_bikes_available
    above: 0
conditions:
  - condition: time
    after: "17:00:00"
    before: "19:00:00"
actions:
  - action: notify.mobile_app_my_phone
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
conditions:
  - condition: numeric_state
    above: 0
card:
  type: entities
  title: Bikes available near me
```

## Known Limitations

- **Niederösterreich dock data is incomplete.** The `nextbike_la` system publishes `capacity` for only 10 of its 252 stations (September 2026), and permanently reports `num_docks_available: 0` for the rest — regardless of whether the station is empty or full. The integration detects this (missing `capacity` field) and reports the `Docks available` sensor as **`unknown`** rather than a misleading `0`. Innsbruck, Tirol, Linz and Klagenfurt publish dock counts for (nearly) every station, Wien for about three in four.
- **Station IDs are stable but `bike_id`s rotate** (privacy rotation by nextbike). Don't write automations keyed on individual bike identifiers — they won't persist across ticks.
- **Virtual stations** (`is_virtual_station: true`) are geofences without physical docks. The `Docks available` sensor reads 0 or `unknown` on these by design; use the `Bikes available` sensor instead.
- **`num_bikes_available` can exceed `capacity`** when bikes are crammed at full stations. Don't template on `capacity - bikes` as a synonym for "docks free".
- **Per-bike detail is opt-in.** `free_bike_status.json` (battery via `current_fuel_percent`, plus `is_reserved` / `is_disabled` flags) is skipped entirely unless *Track e-bike battery state* is enabled — bandwidth profile in [Data Updates](#data-updates).
- **E-bikes run only in Wien and Klagenfurt** (September 2026). There, every e-bike reports its charge. In the other four systems the `E-bikes available` sensor reads 0 and battery tracking has nothing to show.
- **No long-term statistics.** The sensors have no `state_class`: bike counts jump with every rental and return, so hourly averages carry no useful signal. State history is still recorded.

## Troubleshooting

- **"Cannot connect" during setup.** The `station_information` probe failed. Usually transient; retry. Verify connectivity to `https://gbfs.nextbike.net/maps/gbfs/v2/`.
- **Sensor state stuck at `unavailable`.** The station may have been retired upstream. Check for a Repairs notification (`station_gone`) — if present, add a different station and delete this entry; the notification disappears with the next restart. Without a Repairs notification, the feed was probably down: polling backs off to once an hour during an outage, so recovery can take up to an hour. Reload the entry to fetch right away.
- **All three sensors read 0 for a Wien or Innsbruck station.** The station is real, it just happens to be empty (or full). Watch for a couple of minutes; city-center stations turn over constantly.
- **Collecting diagnostics for a bug report.** Settings → Devices & Services → Nextbike Austria → ⋮ → Download diagnostics. Coordinates are redacted automatically; the station name and id stay in so the report makes sense.
- **Posting a log in an issue.** The integration's own log lines name only the system (the city), never your station. Home Assistant itself can put the station's name into a setup error ("Error setting up entry Hoher Markt for nextbike_austria"), so search the log for it before you post.
- **Debug logs.** Settings → Devices & Services → Nextbike Austria → ⋮ → **Enable debug logging**, reproduce the problem, then disable it to download the log. Or in YAML:
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

1. **Settings → Devices & Services** → Nextbike Austria → ⋮ on the entry → **Delete**. That removes the station's device and its three sensors.
2. Repeat for each tracked station (one entry per station). Deleting the last entry also removes the card's dashboard resource.
3. To uninstall, remove **Nextbike Austria** in HACS (or delete `custom_components/nextbike_austria/` for a manual install), then restart Home Assistant.

## Development

Dev setup, tests and the verification gate are in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE). The integration code is MIT; nextbike data flowing through it is CC0-1.0 (public domain).

## Disclaimer

This integration is not affiliated with or endorsed by nextbike GmbH. All station and bike-availability data is provided through public [GBFS 2.3 feeds](https://github.com/MobilityData/gbfs) operated by nextbike and its Austrian partners, and is published under the Creative Commons Zero 1.0 Public Domain Dedication (CC0-1.0). The developer assumes no liability for the accuracy, completeness, or timeliness of the displayed data — including but not limited to bike availability, dock availability, station operational status, or e-bike battery charge. Use at your own risk.

---

Diese Integration steht in keiner Verbindung zur nextbike GmbH und wird von dieser nicht unterstützt. Alle Stations- und Verfügbarkeitsdaten stammen aus öffentlichen [GBFS-2.3-Feeds](https://github.com/MobilityData/gbfs), die von nextbike und ihren österreichischen Partnern betrieben und unter der Creative-Commons-Lizenz „Public Domain Dedication" (CC0-1.0) veröffentlicht werden. Für die Richtigkeit, Vollständigkeit und Aktualität der angezeigten Daten — einschließlich Rad- und Platzverfügbarkeit, Stationsstatus oder E-Bike-Akkustand — wird keine Haftung übernommen. Nutzung auf eigene Verantwortung.
