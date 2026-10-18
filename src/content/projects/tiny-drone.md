---
title: Autonomous tiny drone
summary: Connecting a control loop to the physical world.
description:
  - An embedded-systems project exploring flight stabilization and sensor integration on a small drone.
  - C/C++ control loops work with a Python serial-telemetry ground station to inspect sensor readings and controller behavior.
role: Firmware and telemetry development
status: in-progress
category: Embedded systems
skills: [C/C++, Python, Automated Test Suites, Data Logging]
updatedAt: '2026-10-17'
draft: false
featuredOrder: 3
legacyId: project-03
visual: control
diagram: [Sensors, PID control, Actuators, UART telemetry, Ground station]
---

## The problem

An embedded controller has to respond to physical measurements on a predictable schedule. This project brings together sensor integration, feedback control, and tooling to inspect what happens inside the loop.

## My contribution

I worked on C/C++ firmware for PID-based stabilization and a Python ground station for serial telemetry. The focus is the relationship between sensor readings, control decisions, and observable behavior.

## Approach

Keep the timing-sensitive control loop separate from the ground-station interface. Send telemetry over UART so readings can be inspected without making the user interface part of the control path.

## Evaluation

Useful evaluation starts with repeatable sensor and controller scenarios. The architecture illustration on this page describes the intended data flow; it is not recorded flight telemetry or evidence of certified flight performance.

## Trade-offs and limitations

Sensor noise, timing jitter, and actuator response affect tuning. A small test rig is useful for studying these effects before broader flight testing.

## Next steps

Document the test setup, controller parameters, and a repeatable set of stabilization experiments.
