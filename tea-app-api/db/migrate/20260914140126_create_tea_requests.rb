class CreateTeaRequests < ActiveRecord::Migration[8.1]
  def change
    create_table :tea_requests do |t|
      t.references :user, null: false, foreign_key: true
      t.references :tea, null: false, foreign_key: true
      t.jsonb :preference

      t.timestamps
    end
  end
end
