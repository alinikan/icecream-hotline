import { Minus, Plus, Shuffle, Trash2, ArrowUpRight } from "lucide-react";

export default function OrderPanel({
  mood,
  cartItems,
  toppings,
  selectedToppings,
  container,
  note,
  onUpdateQty,
  onRemove,
  onContainer,
  onToggleTopping,
  onNote,
  onPlace,
  onSurprise,
  total,
}) {
  const hasItems = cartItems.length > 0;
  const totalScoops = cartItems.reduce((sum, item) => sum + item.qty, 0);
  return (
    <div className="order-panel">
      <span className="eyebrow">A LITTLE TREAT, COMING RIGHT UP</span>
      <h2>Your cup of happy.</h2>
      <p className="order-mood">
        {mood.emoji} {mood.name} · {totalScoops} scoop
        {totalScoops !== 1 ? "s" : ""}
      </p>
      <div className="order-items">
        {!hasItems ? (
          <p className="empty-order">
            Your cup is ready for a little imagination.
            <br />
            Pick a flavour from the studio.
          </p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="order-item">
              <span className="order-item-emoji">{item.emoji}</span>
              <div>
                <b>{item.name}</b>
                <span>${item.price.toFixed(2)} per scoop</span>
              </div>
              <div className="quantity-controls">
                <button
                  className="icon-button"
                  aria-label={`Remove one ${item.name}`}
                  onClick={() => onUpdateQty(item.id, -1)}
                >
                  <Minus size={13} />
                </button>
                <span>{item.qty}</span>
                <button
                  className="icon-button"
                  aria-label={`Add one ${item.name}`}
                  disabled={totalScoops >= 6}
                  onClick={() => onUpdateQty(item.id, 1)}
                >
                  <Plus size={13} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Remove all ${item.name}`}
                  onClick={() => onRemove(item.id)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <label className="field-label">Make it yours</label>
      <div className="order-containers">
        {[
          ["cup", "Classic cup"],
          ["cone", "Sugar cone"],
          ["waffle", "Waffle cone"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={container === id}
            className={container === id ? "selected" : ""}
            onClick={() => onContainer(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="field-label">Finishing touches</label>
      <div className="order-toppings">
        {toppings.map((topping) => (
          <button
            key={topping.id}
            aria-pressed={selectedToppings.includes(topping.id)}
            className={selectedToppings.includes(topping.id) ? "selected" : ""}
            onClick={() => onToggleTopping(topping.id)}
          >
            {topping.emoji} {topping.name}
          </button>
        ))}
      </div>
      <label className="field-label" htmlFor="order-note">
        A special little request?
      </label>
      <textarea
        id="order-note"
        rows={2}
        maxLength={500}
        placeholder="Extra sprinkles. Obviously."
        value={note}
        onChange={(event) => onNote(event.target.value)}
      />
      <div className="order-total">
        <span>
          Total <small>Entirely pretend. Entirely delightful.</small>
        </span>
        <strong>${total.toFixed(2)}</strong>
      </div>
      <button
        className="primary-button order-submit"
        onClick={onPlace}
        disabled={!hasItems}
      >
        Place pretend order <ArrowUpRight size={18} />
      </button>
      <button className="text-button order-surprise" onClick={onSurprise}>
        <Shuffle size={14} /> Let the universe pick
      </button>
    </div>
  );
}
