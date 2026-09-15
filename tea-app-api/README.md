# README

POST /api/v1/recommendations
Takes in a request body as follows
{ "preferences": {
    "mood": ["moodA", "moodB"],
    "flavor": ["floral"],
    "sweetness": 0.5
  }
}

Header should contain JWT Bearer Token
In postman, pick the Authorization tab, Bearer token Auth type, paste it there

Tea instance has the following structure
 {
        "id": 1,
        "name_en": "Jasmine Green Tea",
        "category": [
            "green",
            "scented"
        ],
        "flavor_primary": "floral",
        "created_at": "2026-09-15T08:28:55.568Z",
        "updated_at": "2026-09-15T08:28:55.568Z"
    },

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...
