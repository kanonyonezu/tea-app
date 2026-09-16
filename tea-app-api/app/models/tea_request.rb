class TeaRequest < ApplicationRecord
  belongs_to :user

  validate :tea_ids_must_exist

  def teas
    Tea.where(id: tea_id)
  end

  def teas=(teas)
    self.tea_id = teas.map(&:id)
  end

  private

  def tea_ids_must_exist
    missing = tea_id - Tea.where(id: tea_id).pluck(:id)
    errors.add(:tea_id, "contains invalid tea ids: #{missing}") if missing.any?
  end
end
