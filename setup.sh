#!/bin/bash
# Script 1: Install dependencies (run once after cloning into /workspace)
# Usage: bash /workspace/repurposebot/setup.sh

set -e

echo "Installing dependencies..."
pip3 install fastapi uvicorn httpx sse-starlette PyMuPDF pytest playwright
playwright install chromium

echo "Done. Image is ready to share."
