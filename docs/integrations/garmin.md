# Garmin Connect Integration Guide

To enable full wellness synchronization (Body Battery, Sleep, Stress) via Intervals.icu, you must configure your Garmin Connect permissions correctly.

## Prerequisites

1. **Intervals.icu Account**: Ensure you have an account at [intervals.icu](https://intervals.icu).
2. **Garmin Connect Account**: Your data source.

## Step-by-Step Configuration

1. **Link Garmin to Intervals.icu**:
    * Go to **Intervals.icu Settings** > **Integrations**.
    * Click **Connect Garmin**.
    * Login with your Garmin credentials.

2. **Authorize Health Data**:
    * During authorization, ensure you toggle **ON** the specific permission for:
        * `Daily Health Stats` (Required for Resting HR, Sleep, Weight)
        * `Activities` (Required for Workouts)
    * *Note: Without 'Daily Health Stats', IronForge will not receive Sleep Score or Body Battery data.*

3. **Verify Data Flow**:
    * Check your Intervals.icu **Wellness** tab.
    * Ensure columns for `Sleep Score`, `Resting HR`, and `SpO2` are populated.
    * IronForge syncs this data every time you visit the dashboard.

## Troubleshooting

* **Missing Sleep Data**: Garmin only sends sleep data *after* you wake up and sync your watch. Ensure your watch has synced with the Garmin Connect app on your phone.
* **Wrong RHR**: Intervals.icu might calculate its own RHR. In Settings, check "Use Garmin RHR".
