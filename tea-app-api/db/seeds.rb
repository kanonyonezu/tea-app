# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
puts "Cleaning db..."
User.destroy_all
Tea.destroy_all

puts "Creating user..."
User.create!(email: "test@mail.com", password: "secret")

puts "Creating teas..."
[
  { name_en: "Jasmine Green Tea", flavor_primary: "floral", category: [ "green", "scented" ] },
  { name_en: "Earl Grey", flavor_primary: "citrus", category: [ "black", "flavored" ] },
  { name_en: "Tieguanyin", flavor_primary: "floral", category: [ "oolong" ] },
  { name_en: "Pu-erh", flavor_primary: "earthy", category: [ "dark", "fermented" ] },
  { name_en: "Silver Needle", flavor_primary: "sweet", category: [ "white" ] }
].each do |attrs|
  Tea.create!(name_en: attrs[:name_en]) do |tea|
    tea.flavor_primary = attrs[:flavor_primary]
    tea.category = attrs[:category]
  end
end

puts "Created #{Tea.count} teas with #{User.count} user."
