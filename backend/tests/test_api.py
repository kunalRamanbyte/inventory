import pytest

@pytest.mark.asyncio
async def test_read_items_empty(client):
    response = await client.get("/api/items")
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.asyncio
async def test_create_and_read_item(client):
    # 1. Create an item
    item_data = {
        "name": "Test Item",
        "description": "Test Description",
        "price": 10.99,
        "quantity": 5
    }
    create_response = await client.post("/api/items", json=item_data)
    assert create_response.status_code == 200
    
    # 2. Verify it's in the list
    read_response = await client.get("/api/items")
    assert read_response.status_code == 200
    data = read_response.json()
    assert len(data) >= 1
    assert any(item["name"] == "Test Item" for item in data)
