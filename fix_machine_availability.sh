#!/bin/bash
# Script to fix machine availability slots via API calls
# This creates availability slots for all machines that don't have them

set -e

API_BASE_URL="http://localhost:8080"
ADMIN_EMAIL="superadmin@gymsystem.com"
ADMIN_PASSWORD="admin@123"  # Change if different

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Machine Availability Fixer${NC}"
echo "======================================"

# Step 1: Login as admin to get JWT token
echo -e "${YELLOW}Step 1: Authenticating as admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Authentication failed. Response: $LOGIN_RESPONSE${NC}"
  echo "Make sure:"
  echo "  1. Backend is running on http://localhost:8080"
  echo "  2. Admin credentials are correct"
  exit 1
fi

echo -e "${GREEN}✓ Authenticated successfully${NC}"

# Step 2: Get all machines
echo -e "${YELLOW}Step 2: Fetching machines...${NC}"
MACHINES=$(curl -s -X GET "$API_BASE_URL/api/machines" \
  -H "Authorization: Bearer $TOKEN")

echo "Machines response: $MACHINES"

# Extract machine IDs and create availability slots
MACHINE_IDS=$(echo "$MACHINES" | grep -o '"id":[0-9]*' | cut -d':' -f2 | sort -u)

if [ -z "$MACHINE_IDS" ]; then
  echo -e "${RED}✗ No machines found or could not parse response${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Found machines: $MACHINE_IDS${NC}"

# Step 3: Create availability slots for each machine
echo -e "${YELLOW}Step 3: Creating availability slots...${NC}"

DAYS=("MONDAY" "TUESDAY" "WEDNESDAY" "THURSDAY" "FRIDAY" "SATURDAY" "SUNDAY")

for MACHINE_ID in $MACHINE_IDS; do
  echo -e "Processing Machine ID: $MACHINE_ID"

  for DAY in "${DAYS[@]}"; do
    RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/machines/$MACHINE_ID/availability" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"dayOfWeek\": \"$DAY\",
        \"startTime\": \"06:00\",
        \"endTime\": \"22:00\",
        \"maxBookings\": 5,
        \"isActive\": true
      }")

    # Check if successful (contains id field)
    if echo "$RESPONSE" | grep -q '"id"'; then
      echo -e "  ${GREEN}✓ $DAY${NC}"
    else
      # Might already exist or overlap, that's ok
      if echo "$RESPONSE" | grep -q "overlaps"; then
        echo -e "  ${YELLOW}~ $DAY (already exists)${NC}"
      else
        echo -e "  ${YELLOW}~ $DAY${NC}"
      fi
    fi
  done
done

echo -e "${GREEN}======================================"
echo "✓ Machine availability slots setup complete!${NC}"
echo ""
echo "You can now book machines on any day of the week (6 AM to 10 PM)"
