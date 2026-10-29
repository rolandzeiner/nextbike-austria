# <sub><sub><img src="https://raw.githubusercontent.com/rolandzeiner/nextbike-austria/main/custom_components/nextbike_austria/brand/icon.png" width="40" height="40" alt=""></sub></sub> Nextbike Austria

[![Marketplace](https://img.shields.io/badge/Marketplace-Catalog-41BDF5.svg)](https://www.home-assistant.io/integrations/marketplace/)
[![HA min version](https://img.shields.io/badge/Home%20Assistant-%3E%3D2025.1-blue.svg)](https://www.home-assistant.io/)
[![Version](https://img.shields.io/github/v/release/rolandzeiner/nextbike-austria?label=version&color=blue)](https://github.com/rolandzeiner/nextbike-austria/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![vibe-coded](https://img.shields.io/badge/vibe-coded-ff69b4?logo=musicbrainz&logoColor=white)](https://en.wikipedia.org/wiki/Vibe_coding)
[![Live demo](https://img.shields.io/badge/live-demo-2196F3.svg)](https://demo.rolandzeiner.at/#nextbike)

Shows how many bikes, e-bikes and free docks a nextbike station in Austria has right now, read from nextbike's public [GBFS 2.3 feeds](https://github.com/MobilityData/gbfs). Each station becomes a device with three sensors, and a bundled card draws its rack slot by slot.

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

## Features

- **Live station state**: bikes, e-bikes and free docks for any station in six Austrian nextbike systems. No API key.
- **Set up by name**: pick a city, type part of a station name, pick the station.
- **A card that draws the rack**: one slot per dock, with e-bike charge, status warnings and a link to rent in the nextbike app.
- **E-bike battery and reservations, optional**: average, lowest and highest charge per station, plus reserved and out-of-service bikes.
- **One request per city**: every station you track in the same system shares one poll and refreshes at the same moment.
- **Tells you when nextbike is down**: a Repairs notice names the affected system or a retired station, and clears itself once it's back.
- **Card suggested from the sensor**: adding a card from one of its sensors offers the bundled card, already configured (Home Assistant 2026.6 or newer).
- **English and German**: setup, options, entity names and the card.

## Requirements

- Home Assistant **2025.1.0** or newer.
- Outbound HTTPS to `gbfs.nextbike.net`. No account and no API key: the feeds are public.

### Supported systems

Station counts are from the live feeds, September 2026.

| System | Region | Stations |
|---|---|---:|
| `nextbike_wr` | Wien — **WienMobil Rad** | ~260 |
| `nextbike_la` | **Niederösterreich** (St. Pölten, Wr. Neustadt, Tulln, Mödling and more) | ~252 |
| `nextbike_si` | Innsbruck — **Stadtrad** | ~55 |
| `nextbike_vt` | Tirol — **VVT REGIORAD** (Kufstein) | ~23 |
| `nextbike_al` | Linz — **city bike Linz** | ~54 |
| `nextbike_ka` | **Klagenfurt** | ~51 |

If your city runs nextbike under another `system_id`, open an issue. Adding a system is a small change once its feed is verified.

## Installation

### Marketplace (recommended)

The Marketplace is HACS, built into Home Assistant since 2026.11.

1. In Home Assistant, go to **Settings → Marketplace** and search for **Nextbike Austria**.
2. Select it, then select **Install**. The setup starts right away, no restart needed.

[![Open this repository in the Marketplace of your Home Assistant.](https://my.home-assistant.io/badges/marketplace_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=rolandzeiner&repository=nextbike-austria&category=integration)

On Home Assistant older than 2026.11, use HACS instead: search for **Nextbike Austria**, select **Download**, then restart Home Assistant.

### Manual

1. Download `nextbike_austria.zip` from the [latest release](https://github.com/rolandzeiner/nextbike-austria/releases/latest).
2. Extract it into `config/custom_components/nextbike_austria/`.
3. Restart Home Assistant.

## Setup

[![Open your Home Assistant instance and start setting up a new integration.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=nextbike_austria)

1. Go to **Settings → Devices & services → Add integration** and search for **Nextbike Austria**.
2. Pick the nextbike system for your city or region.
3. Type at least 2 characters of the station name and submit. The integration fetches the current station list, which also checks that the feed is reachable.
4. Pick the station. Labels show the capacity where the system publishes it, such as `Hoher Markt (capacity 25)`. If the station isn't listed, choose **↩ Search again**.
5. Set the update interval and submit.

Each station is its own entry with its own device. To add another, run **Add integration** again.

| Field | Default | Description |
|---|---|---|
| **System** | none | One of the six systems in *Supported systems*. Fixed once the entry exists. |
| **Station name** | none | Part of the station name, at least 2 characters. Filters the list of stations. |
| **Station** | none | Picked from the live list. Fixed once the entry exists. |
| **Update interval (seconds)** | `60` | How often the station is polled, from 60 to 900 seconds. 60 is the feed's own refresh time, so polling faster would return the same data. |

## Options

Open **Settings → Devices & services → Nextbike Austria → Configure**. An entry stays tied to its station: to track a different station or system, add a new entry and delete the old one.

| Field | Default | Description |
|---|---|---|
| **Update interval (seconds)** | `60` | As in setup, 60 to 900 seconds. |
| **Track e-bike battery state** | off | Fetches one more feed every 20 minutes for battery, reserved and out-of-service bikes. See *Data updates* for the bandwidth. |

## Entities

Each station is a device with three sensors.

| Sensor | State | Notes |
|---|---|---|
| **Bikes available** | Bikes you can rent now | Reserved and out-of-service bikes don't count. Carries the station details the card reads. |
| **Docks available** | Free docks | `unknown` for stations that publish no capacity, since their dock count can't be trusted. Also carries `is_virtual_station` and `capacity`. |
| **E-bikes available** | E-bikes you can rent now | Reads 0 in systems without e-bikes. |

### Bikes available attributes

| Attribute | Type | Notes |
|---|---|---|
| `attribution` | string | `Data: nextbike GmbH, CC0-1.0` |
| `station_id` | string | GBFS station id, stable across polls. |
| `system_id` | string | One of the six system ids in *Supported systems*. |
| `system_label` | string | Region name, such as `Wien`. |
| `station_display_name` | string | The station name from setup, without the sensor's name. |
| `capacity` | int or null | Total docks. `null` where the system doesn't publish it (most of Niederösterreich). |
| `num_docks_available` | int | Free docks as nextbike reports them. The **Docks available** sensor reads `unknown` where this value can't be trusted. |
| `is_virtual_station` | bool | `true` for a geofenced zone without physical docks. |
| `latitude` / `longitude` | float | Coordinates. Redacted from diagnostics. |
| `is_installed` / `is_renting` / `is_returning` | bool | Station online, can rent, can return. |
| `last_reported` | string | When the station last reported, ISO 8601 UTC, such as `2026-09-29T12:00:00+00:00`. |
| `vehicle_types_available` | list | Count per vehicle type: `[{"vehicle_type_id": "183", "count": 17}, …]`. |
| `rental_uri` | string | `https://nxtb.it/p/{id}`, opens the station in the nextbike app. |
| `e_bike_vehicle_type_ids` | list | The system's e-bike vehicle-type ids, where it lists any. |

`last_reported`, `vehicle_types_available` and `e_bike_battery_list` change on nearly every poll, so they stay out of the recorder's history.

### With battery tracking on

With **Track e-bike battery state** on, **Bikes available** also carries these. A key is left out when its source has nothing, so templates can check `'x' in attrs`.

| Attribute | Type | Notes |
|---|---|---|
| `e_bike_avg_battery_pct`, `e_bike_min_battery_pct`, `e_bike_max_battery_pct` | float | Charge of the station's e-bikes. Left out when no e-bike there reports one. |
| `e_bike_range_samples` | int | How many bikes reported a charge. |
| `e_bike_battery_list` | list | Highest charge first: `[{"pct": 95.0, "type": "E-Bike"}, …]`. The card fills each e-bike slot from it. |
| `bikes_reserved` | int | Bikes at the station but held by another user. Only when above 0. |
| `bikes_reserved_types` | list | Vehicle type of each reserved bike. |
| `bikes_disabled` | int | Bikes at the station but out of service, such as a flat tyre or a broken lock. Only when above 0. |
| `bikes_disabled_types` | list | Vehicle type of each disabled bike. |
| `vehicle_type_names` | dict | `{vehicle_type_id: name}`, for the card's slot tooltips. |

## Cards

The card ships with the integration and registers itself, so there is no dashboard resource to add. Pick **Nextbike Austria Card** in the card picker, or add it in YAML:

```yaml
type: custom:nextbike-austria-card
entities:
  - entity: sensor.hoher_markt_bikes_available
  - entity: sensor.oper_karlsplatz_u_bikes_available
layout: tabs
```

Point `entities` at **Bikes available** sensors: they carry the station details the card draws. The visual editor offers every option below.

| Option | Type | Default | Description |
|---|---|---|---|
| `entities` | list | first station found | The stations to show. A station whose sensor is gone falls back to the first one found. |
| `layout` | `stacked` or `tabs` | `stacked` | `stacked` shows every station in one column. `tabs` adds a tab strip once two or more stations are picked. |
| `show_rack` | boolean | `true` | The bike rack, one slot per dock. Only for stations that publish a capacity. |
| `show_legend` | boolean | `true` | The key under the rack. |
| `show_ebikes` | boolean | `true` | The e-bike count. |
| `show_battery` | boolean | `true` | Fills each e-bike slot to its charge and shows the station's average charge beside the e-bike count. Needs **Track e-bike battery state** on the station's entry. |
| `show_docks` | boolean | `true` | The free-docks count. Hidden for stations without a published capacity. |
| `show_flags` | boolean | `true` | Warnings when the station is offline, not renting or not taking returns, and a note on virtual stations. |
| `show_timestamp` | boolean | `true` | How long ago the station last reported. |
| `show_rent_button` | boolean | `true` | A link that opens the station in the nextbike app. |
| `hide_header` | boolean | `false` | Hides the station name, region and map link. |
| `hide_attribution` | boolean | `false` | Hides the data-source line. |

Reserved and out-of-service bikes show as lock and wrench slots in the rack, also only with **Track e-bike battery state** on. When nextbike's feed fails, the card says *Can't reach nextbike* instead of showing 0 bikes. Cards configured with a single `entity:` keep working.

## Data updates

- **Every 60 seconds by default**, the feed's own refresh time. Set 60 to 900 seconds per entry.
- **One request per system per poll**, however many of its stations you track. They all update from the same snapshot, so two stations never disagree about how fresh they are.
- **Station names, coordinates and capacity every 6 hours**, since they change only when an operator installs or renames a rack. A station the live feed reports but the cached list doesn't know triggers a refresh at once, so a new rack appears on the next poll. The vehicle-type list follows the same 6-hour clock.
- **Compressed transfers**: every feed arrives gzip-compressed, 21 times smaller for Wien's live station feed. There is no `If-Modified-Since` check, because nextbike stamps each feed as new every minute, so a `304 Not Modified` never comes back at these intervals (measured September 2026).
- **Battery tracking** fetches `free_bike_status.json` every 20 minutes when at least one entry has it on, independent of the station poll. For Wien, the largest system, that is about 80 KB per fetch, roughly 6 MB a day or 180 MB a month (measured September 2026). The other systems need less. The 20 minutes hold after a failure too.
- **Back-off on errors**: from the second failed poll in a row, the interval doubles with each further failure, up to 1 hour. The first poll that works restores your interval. A failed request also pauses the whole system for a minute, so its other stations report the same error instead of asking again. If nextbike answers `429` or `503` with a `Retry-After` header, the integration waits that long, up to a day.
- **Outages**: after 10 minutes of errors from nextbike's side, a Repairs issue names the affected system. It clears itself once bike counts return.
- **Partial failures**: a missing or unreadable feed makes only the affected entry `unavailable`, and the others keep their data. The error message names the cause: a timeout, an HTTP status or an invalid response.

## Examples

- **Commute**: if the station by your flat has no bikes at 07:15, get a push so you walk to the S-Bahn instead.
- **Returning a bike**: if your home station has fewer than 2 free docks as you head home, get told to divert. Needs a system that publishes capacity.
- **E-bikes**: get notified when an e-bike appears at Hauptbahnhof between 17:00 and 19:00, from the **E-bikes available** sensor.
- **Dashboards**: show which nearby stations are empty or full, each with its `rental_uri` as a one-tap rental link.

Notify when an e-bike shows up at your home station during the evening rush. Paste it into **Settings → Automations & scenes → Create automation → ⋮ → Edit in YAML**:

```yaml
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

<details>
<summary>A dashboard card that lists only stations with bikes right now</summary>

Entity ids come from the station name and your language. Look up yours under **Developer tools → States**.

```yaml
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

</details>

## Known limitations

- **Niederösterreich's dock data is incomplete.** `nextbike_la` publishes a capacity for only 10 of its 252 stations (September 2026) and reports 0 free docks for the rest, empty or full. The integration spots the missing capacity and reports **Docks available** as `unknown` instead of a misleading 0. Innsbruck, Tirol, Linz and Klagenfurt publish dock counts for nearly every station, Wien for about three in four.
- **Bike ids rotate.** nextbike changes them for privacy, so don't build automations on a single bike. Station ids are stable.
- **Virtual stations** (`is_virtual_station: true`) are geofences without physical docks. **Docks available** reads 0 or `unknown` there by design; use **Bikes available** instead.
- **Bikes can exceed capacity** when they're crammed in at a full station, so `capacity - bikes` is not the number of free docks.
- **Per-bike detail is opt-in.** Battery, reserved and out-of-service bikes come only with **Track e-bike battery state** on.
- **E-bikes run only in Wien and Klagenfurt** (September 2026), where every e-bike reports its charge. In the other four systems **E-bikes available** reads 0 and battery tracking has nothing to show.
- **No long-term statistics.** The sensors have no `state_class`: bike counts jump with every rental and return, so hourly averages say nothing useful. State history is still recorded.

## Troubleshooting

- **"Could not reach the nextbike GBFS API" during setup.** Fetching the station list failed. It's usually brief, so try again. Check that Home Assistant can reach `https://gbfs.nextbike.net/maps/gbfs/v2/`.
- **A sensor stays `unavailable`.** The station may have been retired. Look for a **station missing** notice under **Settings → Repairs**: if it's there, add a different station and delete this entry. If Repairs says nextbike isn't sending station data, the feed is down instead. Polling backs off to once an hour during an outage, so recovery can take up to an hour; reload the entry to fetch at once.
- **The card says *Can't reach nextbike*.** The last poll failed, or none has worked since Home Assistant started. Check **Settings → Repairs**. If the outage notice for your system is there, the fault is on nextbike's side and the counts return on their own. If not, check that your host can reach `gbfs.nextbike.net`.
- **All three sensors read 0 at a Wien or Innsbruck station.** The station is real and just empty, or full. Watch it for a few minutes; stations in the centre turn over constantly.
- **Diagnostics for a bug report.** **Settings → Devices & services → Nextbike Austria → ⋮ → Download diagnostics**. Coordinates are redacted; the station name and id stay in so the report makes sense.
- **Posting a log.** The integration's own log lines name only the system (the city), never your station. Home Assistant itself can put the station's name into a setup error, such as "Error setting up entry Hoher Markt for nextbike_austria", so search the log for it before you post.
- **Debug logs.** **Settings → Devices & services → Nextbike Austria → ⋮ → Enable debug logging**, reproduce the problem, then disable it to download the log. Or in `configuration.yaml`:

  ```yaml
  logger:
    default: info
    logs:
      custom_components.nextbike_austria: debug
  ```

## Removal

1. Go to **Settings → Devices & services → Nextbike Austria**, then ⋮ on the entry → **Delete**. That removes the station's device and its three sensors. Repeat for each station. Deleting the last entry also removes the card's dashboard resource.
2. To uninstall, in **Settings → Marketplace**, open **Nextbike Austria**, then ⋮ → **Uninstall**. If an entry is still set up, the Marketplace offers **Delete and uninstall**, and a repair asks you to restart.

After a manual install, delete `custom_components/nextbike_austria/` and restart Home Assistant instead.

## Attribution

Icon: Font Awesome Free, CC BY 4.0.

## License

The code is [MIT](https://github.com/rolandzeiner/nextbike-austria/blob/main/LICENSE). nextbike's data is CC0-1.0 (public domain).

To build from source or contribute, see [CONTRIBUTING.md](https://github.com/rolandzeiner/nextbike-austria/blob/main/CONTRIBUTING.md).

## Disclaimer

This integration is not affiliated with or endorsed by nextbike GmbH. Station and bike data comes from nextbike's public [GBFS 2.3 feeds](https://github.com/MobilityData/gbfs) under CC0-1.0 (public domain). **A bike or dock shown as free may be taken by the time you get there.** The developer assumes no liability for the accuracy, completeness or timeliness of the displayed data. Use at your own risk.

---

Diese Integration steht in keiner Verbindung zur nextbike GmbH und wird von ihr nicht unterstützt. Die Stations- und Raddaten stammen aus den öffentlichen [GBFS-2.3-Feeds](https://github.com/MobilityData/gbfs) von nextbike und stehen unter CC0-1.0 (gemeinfrei). **Ein als frei angezeigtes Rad oder ein freier Platz kann schon vergeben sein, wenn du ankommst.** Für die Richtigkeit, Vollständigkeit und Aktualität der angezeigten Daten wird keine Haftung übernommen. Nutzung auf eigene Verantwortung.
